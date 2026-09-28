import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  RefreshCw,
  User,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const STORAGE_KEY_N8N_MESSAGES = 'studypulse_n8n_chat_history_v1';
const STORAGE_KEY_N8N_SESSION = 'studypulse_n8n_chat_session_id';

const STARTER_PROMPTS = [
  {
    title: 'Study Strategy',
    text: 'How should I prioritize my study sessions for my hardest exam this week?',
    desc: 'Get customized pacing and prioritization advice',
  },
  {
    title: 'Concept Breakdown',
    text: 'Can you explain Dijkstra algorithm and BFS in simple terms?',
    desc: 'Break down complex college topics',
  },
  {
    title: 'Assignment Scaffolding',
    text: 'Help me brainstorm an outline for a research paper on Renewable Energy Policy',
    desc: 'Structured section ideas and thesis generation',
  },
  {
    title: 'Active Recall',
    text: 'Give me 3 active recall questions on Organic Chemistry mechanisms',
    desc: 'Test your understanding before test day',
  },
];

export const N8nChatView: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session ID persistence
  const [sessionId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_N8N_SESSION);
      if (saved) return saved;
      const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY_N8N_SESSION, newId);
      return newId;
    } catch {
      return `session-${Date.now()}`;
    }
  });

  // Messages list with default welcome
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_N8N_MESSAGES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'bot',
        text: "Hello! 👋 I'm your dedicated AI Study & Assignment Assistant powered by your n8n workflow. What topic, question, or study plan can I help you with today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_N8N_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat history', e);
    }
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/n8n-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sendMessage',
          chatInput: text,
          message: text,
          sessionId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Webhook error ${res.status}`);
      }

      const data = await res.json();

      let botReply = '';
      if (typeof data === 'string') {
        botReply = data;
      } else if (data.output) {
        botReply = data.output;
      } else if (data.text) {
        botReply = data.text;
      } else if (data.response) {
        botReply = data.response;
      } else if (data.message) {
        botReply = data.message;
      } else if (Array.isArray(data) && data.length > 0) {
        const first = data[0];
        botReply = first.output || first.text || first.message || JSON.stringify(first);
      } else {
        botReply = JSON.stringify(data, null, 2);
      }

      const botMessage: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: botReply || "I've received your request! What would you like to explore next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error communicating with n8n chatbot:', err);
      setErrorMessage(
        err.message || 'Could not connect to n8n webhook. Please ensure the workflow is active in n8n.'
      );

      const errorBotMessage: ChatMessage = {
        id: `msg-bot-err-${Date.now()}`,
        sender: 'bot',
        text: "I had trouble connecting to your n8n webhook. Please check that your n8n workflow is published and active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const defaultMsg: ChatMessage = {
      id: 'welcome-msg',
      sender: 'bot',
      text: "Chat history cleared! 👋 Ask me anything about your studies or assignments.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([defaultMsg]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-200 text-xs font-medium mb-3">
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            Connected to n8n Cloud Webhook
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            n8n AI Study Assistant
          </h1>
          <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-4">
            Chat directly with your n8n automated workflow. Ask questions about your courses, request custom study advice, or brainstorm assignment ideas.
          </p>
          <div className="flex items-center gap-2 text-xs text-indigo-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Endpoint:</span>
            <code className="bg-black/30 px-2 py-0.5 rounded font-mono text-[11px] text-white">
              .../webhook/63a61329-e89a-4098-9507-c73ac253f6b6/chat
            </code>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Quick Starters & Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Quick Prompts
              </h3>
            </div>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p.text)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-100 hover:border-indigo-200 transition-all text-xs group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-indigo-900">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                    {p.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs text-slate-600">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Connection Details
            </h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Host:</span>
                <span className="font-mono text-slate-700">yeduvakala45.app.n8n.cloud</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Method:</span>
                <span className="font-mono font-semibold text-emerald-600">POST (JSON)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Session ID:</span>
                <span className="font-mono text-slate-500 truncate max-w-[120px]">{sessionId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Chat Window */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  n8n AI Chatbot
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ready &amp; Listening</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClearHistory}
              className="text-xs font-semibold px-3 py-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
              title="Clear message history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-xs leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                      {msg.text}
                    </div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isUser ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Loader */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask n8n AI chatbot anything about your courses or assignments..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-sm transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
