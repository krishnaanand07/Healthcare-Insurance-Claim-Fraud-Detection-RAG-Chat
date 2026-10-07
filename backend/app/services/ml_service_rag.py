import os
from openai import OpenAI

class RAGService:
    def __init__(self):
        self.api_key = os.environ.get("GROQ_API_KEY", "")
        if self.api_key:
            self.client = OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=self.api_key
            )
        else:
            self.client = None
            
        self.knowledge_base = [
            "Healthcare fraud costs billions of dollars every year.",
            "Common types of fraud include billing for services not rendered, upcoding, and unbundling.",
            "Flagged claims have anomalous patterns in provider-patient distance or duplicate procedures."
        ]

    def query(self, prompt: str) -> str:
        if not self.client:
            return "Error: GROQ_API_KEY environment variable is not set on the server."
            
        system_instruction = (
            "You are a specialized Healthcare Fraud Detection Assistant. "
            "Use the following knowledge base to answer the user's query: \n"
            + "\n".join(f"- {kb}" for kb in self.knowledge_base)
        )
        
        try:
            response = self.client.chat.completions.create(
                model=os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile"),
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"An error occurred while calling the LLM: {str(e)}"

rag_service = RAGService()
