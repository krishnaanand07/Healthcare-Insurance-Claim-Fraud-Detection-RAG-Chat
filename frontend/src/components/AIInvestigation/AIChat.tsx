import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare, Copy, RotateCcw, Trash2, Check } from 'lucide-react';
import { fetchWithTimeout, formatUserErrorMessage } from '../../api/config';

interface AIChatProps {
  claimData: any;
  investigationId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: any[];
  timestamp: string;
  isError?: boolean;
}

export const AIChat: React.FC<AIChatProps> = ({ claimData, investigationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hello! I am your AI Claim Investigation Assistant. I can help you analyze healthcare insurance claims, explain risk factors, reference policy guidelines, and answer follow-up questions.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>(investigationId);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sampleQuestions = [
    "Why was this claim classified as suspicious?",
    "Which features contributed most to the risk score?",
    "What policy guidelines apply to this procedure?",
    "Explain this claim like I am not technical.",
    "What should an investigator verify next?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isSending) return;

    const userMsgId = `user-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsSending(true);

    try {
      const response = await fetchWithTimeout('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          query: query,
          claim: claimData,
          investigation_id: activeId
        })
      }, 15000);

      if (!response.ok) {
        throw new Error(`Chat API error (status ${response.status})`);
      }

      const data = await response.json();
      if (data.investigation_id) {
        setActiveId(data.investigation_id);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "No reply generated.",
        sources: data.retrieved_sources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const appErr = formatUserErrorMessage(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ ${appErr.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: "Conversation history cleared. Ask me any new questions about the current claim analysis.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleRetryLast = () => {
    const lastUserMessage = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage.text);
    }
  };

  return (
    <div className="neo-surface p-6 rounded-2xl flex flex-col h-[580px] bg-white/70 backdrop-blur-md border border-white/60 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#172554] flex items-center justify-center text-[#FACC15] shadow-sm">
            <Bot size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#172554] flex items-center gap-2">
              Healthcare AI Assistant <Sparkles size={16} className="text-[#FACC15]" />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Conversational Fraud Analysis & RAG Grounding</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isSending}
            className="text-[11px] font-semibold text-[#172554] bg-[#EEF3FA] hover:bg-[#FACC15]/40 border border-[#172554]/10 px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shrink-0"
          >
            <MessageSquare size={10} className="text-[#F59E0B]" /> {q}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-[#172554] text-[#FACC15] flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot size={14} />
              </div>
            )}
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium relative group ${
                msg.sender === 'user'
                  ? 'bg-[#172554] text-white rounded-br-none shadow-md'
                  : msg.isError
                  ? 'bg-amber-50 border border-amber-300 text-amber-900 rounded-bl-none shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* RAG Sources Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    RELEVANT POLICY SOURCES:
                  </p>
                  {msg.sources.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="text-[10px] text-[#172554] bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      📄 <strong>{s.filename}</strong> ({s.section})
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp & Copy Button */}
              <div className="mt-2 flex items-center justify-between text-[10px] opacity-75 pt-1">
                <span>{msg.timestamp}</span>
                {msg.sender === 'ai' && !msg.isError && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-[#FACC15] transition-colors flex items-center gap-1 font-semibold"
                  >
                    {copiedId === msg.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shrink-0 mt-1 font-bold text-xs shadow-sm">
                <User size={14} />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-lg bg-[#172554] text-[#FACC15] flex items-center justify-center shrink-0 shadow-sm">
              <Bot size={14} />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-slate-500 shadow-sm">
              <Loader2 size={14} className="animate-spin text-[#F59E0B]" />
              Thinking & reasoning...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Free-Form Input Box */}
      <div className="space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2 items-end"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this claim... (Enter to send, Shift+Enter for newline)"
              className="w-full text-xs neo-input p-3 resize-none custom-scrollbar pr-8 font-medium focus:ring-2 focus:ring-[#FACC15]"
              disabled={isSending}
            />
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="submit"
              disabled={isSending || !inputQuery.trim()}
              className="neo-btn-primary px-4 py-3 text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
            >
              <Send size={14} /> Send
            </button>
            {messages.some(m => m.isError) && (
              <button
                type="button"
                onClick={handleRetryLast}
                disabled={isSending}
                className="px-2 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 justify-center"
              >
                <RotateCcw size={10} /> Retry
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
