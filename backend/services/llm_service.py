import os
import json
import re
import time
import logging
from typing import Dict, Any, List, Optional, Generator
from openai import OpenAI, NotFoundError, AuthenticationError
from schemas.ai_schemas import AIInvestigationAnalysis, SupportingEvidence
from rag.prompts import INVESTIGATION_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT

logger = logging.getLogger("llm_service")

# Default verified models
DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b"
DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite"
DEFAULT_NVIDIA_MODEL = "meta/llama-3.2-11b-vision-instruct"

class MultiLLMRouterService:
    def __init__(self):
        self.client_groq = None
        self.client_gemini = None
        self.client_nvidia = None
        self._permanent_errors = set()  # Track providers with permanent failure (404/401)
        self._init_clients()

    def _init_clients(self):
        # 1. Groq Client (Fast Primary)
        groq_key = os.environ.get("GROQ_API_KEY", "").strip()
        print(f"[LLMRouter] GROQ_API_KEY configured: {bool(groq_key)}")
        if groq_key:
            try:
                self.client_groq = OpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=groq_key,
                    timeout=8.0,
                    max_retries=0  # Fail fast, fallback handles resilience
                )
                print("[LLMRouter] Groq client initialized successfully.")
            except Exception as e:
                print(f"[LLMRouter] Groq init notice: {e}")

        # 2. Gemini Client (Google OpenAI-compatible endpoint - Secondary)
        gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
        print(f"[LLMRouter] GEMINI_API_KEY configured: {bool(gemini_key)}")
        if gemini_key:
            try:
                self.client_gemini = OpenAI(
                    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
                    api_key=gemini_key,
                    timeout=10.0,
                    max_retries=0
                )
                print("[LLMRouter] Gemini client initialized successfully.")
            except Exception as e:
                print(f"[LLMRouter] Gemini init notice: {e}")

        # 3. NVIDIA Client (NVIDIA Hosted API - Third Fallback)
        nvidia_key = os.environ.get("NVIDIA_API_KEY", "").strip()
        nvidia_url = os.environ.get("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()
        print(f"[LLMRouter] NVIDIA_API_KEY configured: {bool(nvidia_key)}")
        if nvidia_key:
            try:
                self.client_nvidia = OpenAI(
                    base_url=nvidia_url,
                    api_key=nvidia_key,
                    timeout=10.0,
                    max_retries=0
                )
                print("[LLMRouter] NVIDIA client initialized successfully.")
            except Exception as e:
                print(f"[LLMRouter] NVIDIA init notice: {e}")

    def get_provider_status(self) -> Dict[str, str]:
        return {
            "groq": "configured" if self.client_groq and "groq" not in self._permanent_errors else ("disabled" if "groq" in self._permanent_errors else "unconfigured"),
            "gemini": "configured" if self.client_gemini and "gemini" not in self._permanent_errors else ("disabled" if "gemini" in self._permanent_errors else "unconfigured"),
            "nvidia": "configured" if self.client_nvidia and "nvidia" not in self._permanent_errors else ("disabled" if "nvidia" in self._permanent_errors else "unconfigured")
        }

    def _get_provider_attempts(self) -> List[tuple]:
        groq_model = os.environ.get("GROQ_MODEL", DEFAULT_GROQ_MODEL).strip()
        if groq_model in ["llama-3.3-70b-versatile", ""]:
            groq_model = DEFAULT_GROQ_MODEL

        gemini_model = os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL).strip()
        if not gemini_model:
            gemini_model = DEFAULT_GEMINI_MODEL

        nvidia_model = os.environ.get("NVIDIA_MODEL", DEFAULT_NVIDIA_MODEL).strip()
        if not nvidia_model:
            nvidia_model = DEFAULT_NVIDIA_MODEL

        attempts = []
        if self.client_groq and "groq" not in self._permanent_errors:
            attempts.append(("groq", self.client_groq, groq_model, 8.0))
        if self.client_gemini and "gemini" not in self._permanent_errors:
            attempts.append(("gemini", self.client_gemini, gemini_model, 10.0))
        if self.client_nvidia and "nvidia" not in self._permanent_errors:
            attempts.append(("nvidia", self.client_nvidia, nvidia_model, 10.0))
        return attempts

    def get_provider_diagnostics(self) -> Dict[str, Any]:
        results = {}
        groq_model = os.environ.get("GROQ_MODEL", DEFAULT_GROQ_MODEL).strip()
        if groq_model in ["llama-3.3-70b-versatile", ""]:
            groq_model = DEFAULT_GROQ_MODEL

        providers = [
            ("groq", self.client_groq, groq_model),
            ("gemini", self.client_gemini, os.environ.get("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)),
            ("nvidia", self.client_nvidia, os.environ.get("NVIDIA_MODEL", DEFAULT_NVIDIA_MODEL))
        ]

        for name, client, model in providers:
            configured = bool(client)
            if not configured or name in self._permanent_errors:
                results[name] = {
                    "configured": configured,
                    "model": model,
                    "status": "disabled" if name in self._permanent_errors else "unconfigured",
                    "latency_ms": 0,
                    "error": "Provider disabled or not configured"
                }
                continue

            t0 = time.time()
            try:
                client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hi"}],
                    max_tokens=5,
                    timeout=5.0
                )
                dt = int((time.time() - t0) * 1000)
                results[name] = {
                    "configured": True,
                    "model": model,
                    "status": "ok",
                    "latency_ms": dt
                }
            except Exception as e:
                dt = int((time.time() - t0) * 1000)
                err_msg = str(e)
                status = "timeout" if "timeout" in err_msg.lower() else "error"
                results[name] = {
                    "configured": True,
                    "model": model,
                    "status": status,
                    "latency_ms": dt,
                    "error": err_msg[:120]
                }

        return results

    def generate_investigation_report(
        self,
        claim_data: Dict[str, Any],
        ml_prediction: Dict[str, Any],
        rag_context: Dict[str, Any]
    ) -> AIInvestigationAnalysis:
        docs = rag_context.get("documents", [])
        metas = rag_context.get("metadata", [])
        scores = rag_context.get("scores", [])

        formatted_context_items = []
        for i in range(len(docs)):
            src = metas[i].get("filename", "knowledge_base") if i < len(metas) else "knowledge_base"
            sec = metas[i].get("section", "") if i < len(metas) else ""
            scr = scores[i] if i < len(scores) else 0.0
            formatted_context_items.append(f"--- Source: {src} (Section: {sec}, Relevance Score: {scr}) ---\n{docs[i]}")

        retrieved_str = "\n\n".join(formatted_context_items) if formatted_context_items else "No relevant knowledge-base documents retrieved."

        user_message = (
            f"CLAIM DATA:\n{json.dumps(claim_data, indent=2)}\n\n"
            f"MACHINE LEARNING PREDICTION:\n{json.dumps(ml_prediction, indent=2)}\n\n"
            f"RETRIEVED RAG EVIDENCE / KNOWLEDGE BASE CONTEXT:\n{retrieved_str}\n\n"
            "Generate the comprehensive AI Investigation Report in valid JSON format."
        )

        messages = [
            {"role": "system", "content": INVESTIGATION_SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]

        attempts = self._get_provider_attempts()

        for provider, client, model, timeout_val in attempts:
            t0 = time.time()
            try:
                print(f"[LLMRouter] Attempting investigation report with '{provider}' ({model})...")
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.2,
                    max_tokens=1024,
                    timeout=timeout_val
                )
                dt = int((time.time() - t0) * 1000)
                content = response.choices[0].message.content
                parsed_dict = self._parse_json_response(content)
                if parsed_dict:
                    ml_prob = ml_prediction.get("fraud_probability")
                    if ml_prob is None and "risk_score" in ml_prediction:
                        ml_prob = round(ml_prediction["risk_score"] / 100.0, 2)
                    if ml_prob is not None:
                        parsed_dict["fraud_probability"] = float(ml_prob)
                    print(f"[LLMRouter] Generated investigation report using '{provider}' ({model}) in {dt}ms.")
                    return AIInvestigationAnalysis(**parsed_dict)
                else:
                    print(f"[LLMRouter] Provider '{provider}' returned non-JSON response in {dt}ms. Trying next provider.")
            except (NotFoundError, AuthenticationError) as perm_err:
                dt = int((time.time() - t0) * 1000)
                print(f"[LLMRouter] Permanent error on '{provider}' ({model}) in {dt}ms: {perm_err}. Bypassing provider for future requests.")
                self._permanent_errors.add(provider)
            except Exception as e:
                dt = int((time.time() - t0) * 1000)
                err_msg = str(e)
                if "model_not_found" in err_msg.lower() or "404" in err_msg:
                    print(f"[LLMRouter] Model not found on '{provider}' ({model}) in {dt}ms. Bypassing provider.")
                    self._permanent_errors.add(provider)
                elif "timeout" in err_msg.lower():
                    print(f"[LLMRouter] Provider '{provider}' timed out after {dt}ms.")
                else:
                    print(f"[LLMRouter] Provider '{provider}' failed in {dt}ms: {err_msg[:120]}")

        print("[LLMRouter] All LLM providers unavailable or failed. Using fast structured fallback report.")
        return self._build_fallback_report(claim_data, ml_prediction, rag_context)

    def generate_chat_reply(
        self,
        query: str,
        claim_data: Optional[Dict[str, Any]],
        rag_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> str:
        messages = self._build_chat_messages(query, claim_data, rag_context, history)
        attempts = self._get_provider_attempts()

        for provider, client, model, timeout_val in attempts:
            t0 = time.time()
            try:
                response = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=768,
                    timeout=timeout_val
                )
                dt = int((time.time() - t0) * 1000)
                reply = response.choices[0].message.content
                print(f"[LLMRouter] Chat reply generated using '{provider}' ({model}) in {dt}ms.")
                return reply
            except (NotFoundError, AuthenticationError) as perm_err:
                dt = int((time.time() - t0) * 1000)
                print(f"[LLMRouter] Permanent error on chat for '{provider}': {perm_err}")
                self._permanent_errors.add(provider)
            except Exception as e:
                dt = int((time.time() - t0) * 1000)
                err_msg = str(e)
                if "model_not_found" in err_msg.lower() or "404" in err_msg:
                    self._permanent_errors.add(provider)
                print(f"[LLMRouter] Provider '{provider}' failed for chat reply in {dt}ms: {err_msg[:120]}")

        docs = rag_context.get("documents", [])
        if docs:
            return f"Based on the healthcare guidelines and claim metrics:\n\n{docs[0][:400]}...\n\n(Note: AI LLM service temporarily in fallback mode)."
        return "The AI assistant evaluated the claim details. The ML model results and claim features indicate anomalies that should be verified by an investigator."

    def generate_chat_reply_stream(
        self,
        query: str,
        claim_data: Optional[Dict[str, Any]],
        rag_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> Generator[str, None, None]:
        messages = self._build_chat_messages(query, claim_data, rag_context, history)
        attempts = self._get_provider_attempts()

        for provider, client, model, timeout_val in attempts:
            t0 = time.time()
            try:
                stream = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=0.3,
                    max_tokens=768,
                    stream=True,
                    timeout=timeout_val
                )
                for chunk in stream:
                    delta = chunk.choices[0].delta.content if chunk.choices and chunk.choices[0].delta else None
                    if delta:
                        yield delta
                dt = int((time.time() - t0) * 1000)
                print(f"[LLMRouter] Stream completed using '{provider}' ({model}) in {dt}ms.")
                return
            except (NotFoundError, AuthenticationError):
                self._permanent_errors.add(provider)
            except Exception as e:
                dt = int((time.time() - t0) * 1000)
                err_msg = str(e)
                if "model_not_found" in err_msg.lower() or "404" in err_msg:
                    self._permanent_errors.add(provider)
                print(f"[LLMRouter] Streaming failed on '{provider}' in {dt}ms: {err_msg[:120]}")

        fallback = self.generate_chat_reply(query, claim_data, rag_context, history)
        for word in fallback.split(" "):
            yield word + " "
            time.sleep(0.02)

    def _build_chat_messages(
        self,
        query: str,
        claim_data: Optional[Dict[str, Any]],
        rag_context: Dict[str, Any],
        history: List[Dict[str, str]]
    ) -> List[Dict[str, str]]:
        docs = rag_context.get("documents", [])
        metas = rag_context.get("metadata", [])

        context_sources = []
        for i, d in enumerate(docs):
            src = metas[i].get("filename", "Doc") if i < len(metas) else "Doc"
            context_sources.append(f"[{src}]: {d}")

        context_str = "\n\n".join(context_sources) if context_sources else "No explicit knowledge base document retrieved."
        messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]

        # Append last 6 turns of conversation history
        for msg in history[-6:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

        prompt_content = f"Question: {query}\n\n"
        if claim_data:
            prompt_content += f"Active Claim Details:\n{json.dumps(claim_data, indent=2)}\n\n"
        if docs:
            prompt_content += f"Retrieved Knowledge Base Evidence:\n{context_str}"

        messages.append({"role": "user", "content": prompt_content})
        return messages

    def _parse_json_response(self, text: str) -> Optional[Dict[str, Any]]:
        if not text:
            return None
        cleaned = text.strip()
        if "```" in cleaned:
            match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
            if match:
                cleaned = match.group(1)
            else:
                cleaned = re.sub(r"^```[a-z]*", "", cleaned)
                cleaned = re.sub(r"```$", "", cleaned).strip()

        try:
            return json.loads(cleaned)
        except Exception:
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
        return None

    def _build_fallback_report(
        self,
        claim_data: Dict[str, Any],
        ml_prediction: Dict[str, Any],
        rag_context: Dict[str, Any]
    ) -> AIInvestigationAnalysis:
        prob = ml_prediction.get("fraud_probability")
        if prob is None and "risk_score" in ml_prediction:
            prob = round(ml_prediction["risk_score"] / 100.0, 2)
        prob = prob if prob is not None else 0.50

        risk_level = ml_prediction.get("risk_level", "MEDIUM")
        insights = ml_prediction.get("insights", ["Claim metrics require human verification."])

        docs = rag_context.get("documents", [])
        metas = rag_context.get("metadata", [])

        evidence_items = []
        for i in range(min(len(docs), 3)):
            src = metas[i].get("filename", "knowledge_base.md") if i < len(metas) else "knowledge_base.md"
            evidence_items.append(SupportingEvidence(
                source=src,
                relevance="High" if i == 0 else "Medium",
                text=docs[i][:200] + "..."
            ))

        return AIInvestigationAnalysis(
            summary=f"Claim evaluated with {risk_level} risk level ({int(prob*100)}% probability). Key anomalies detected in claim metrics.",
            risk_level=risk_level,
            fraud_probability=prob,
            key_risk_factors=insights,
            claim_analysis=f"The machine learning model flagged this claim with risk score {int(prob*100)}. Diagnostic and procedure combinations require investigator audit.",
            supporting_evidence=evidence_items,
            recommended_investigation_steps=[
                "Verify itemized medical records against provider billing logs",
                "Contact patient to confirm service date and location",
                "Check provider licensing and NPI registration status"
            ],
            limitations=[
                "Multi-LLM router in fallback mode",
                "Requires direct human verification of physical medical chart"
            ]
        )

# Singleton and backward compatibility alias
llm_service = MultiLLMRouterService()
NVIDIALLMService = MultiLLMRouterService
