import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Minimize2,
  Maximize2,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const STORAGE_KEY_N8N_MESSAGES = 'studypulse_n8n_chat_history_v1';
const STORAGE_KEY_N8N_SESSION = 'studypulse_n8n_chat_session_id';

const STARTER_SUGGESTIONS = [
  'How should I prioritize my study sessions today?',
  'Explain how to study for high-difficulty courses',
  'Help me break down an assignment question',
  'What are effective techniques for active recall?',
];

export const N8nChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
        text: "Hello! 👋 I'm your AI Study & Assignment Assistant powered by n8n. Ask me any question about your courses, exam preparation, or assignment outlines!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  // Save messages to localStorage
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
      // Send to proxy endpoint (which relays to n8n webhook avoiding CORS issues)
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

      // Extract text from standard n8n output formats
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
        text: botReply || "I received your message! How else can I assist with your studies?",
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
        text: "I had trouble connecting to the n8n webhook. Please check that the n8n workflow is activated and accessible.",
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
      text: "Conversation reset! 👋 What would you like to explore next?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([defaultMsg]);
    setErrorMessage(null);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white px-4 py-3.5 rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 group border border-white/20"
          title="Open n8n AI Chatbot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-indigo-900 animate-pulse" />
          </div>
          <span className="font-bold text-xs sm:text-sm tracking-tight pr-1">
            n8n AI Chatbot
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'w-80 h-16' : 'w-[90vw] sm:w-[410px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 px-4 py-3 text-white flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
                <Bot className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight text-white leading-tight">
                    n8n AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Connected" />
                </div>
                <p className="text-[10px] text-indigo-200/80 leading-none mt-0.5">
                  Powered by n8n Webhook
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-slate-300">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area (Hidden if minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/60 text-xs sm:text-sm">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Bot className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px]">
                          {msg.text}
                        </div>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isUser ? 'text-indigo-200' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <span className="text-rose-600 font-bold shrink-0">✕</span>
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Starter Suggestions (Shown if few messages) */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5">
                  {STARTER_SUGGESTIONS.map((sugg, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(sugg)}
                      className="text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60 text-left"
                    >
                      {sugg}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
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
                    placeholder="Type your study or assignment question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="text-[10px] text-slate-400 mt-1.5 text-center flex items-center justify-center gap-1">
                  <span>Connected to n8n webhook:</span>
                  <code className="text-indigo-600 font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded">
                    yeduvakala45.app.n8n.cloud
                  </code>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
