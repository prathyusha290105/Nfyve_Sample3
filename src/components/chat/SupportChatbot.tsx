import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { api } from '../../api/client';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  quickActions?: { label: string; action: string; url?: string }[];
}

export const SupportChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hi! Welcome to NFYVE – The Change. How can we help you today?',
      quickActions: [
        { label: 'Book an appointment', action: 'navigate', url: '/book-appointment' },
        { label: 'Tell me about services', action: 'text' },
        { label: 'What are your opening hours?', action: 'text' },
        { label: 'Where are you located?', action: 'text' },
        { label: 'I have a question', action: 'text' },
      ],
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(message);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: res.reply,
        quickActions: res.quickActions,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Our concierge desk is available at +91 9000023050 or support@nfyve.com. You can also book directly online.',
        quickActions: [
          { label: 'Book Appointment', action: 'navigate', url: '/book-appointment' },
          { label: 'Contact Us', action: 'navigate', url: '/contact' },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (qa: { label: string; action: string; url?: string }) => {
    if (qa.action === 'navigate' && qa.url) {
      setIsOpen(false);
      navigate(qa.url);
    } else if (qa.action === 'call' && qa.url) {
      window.location.href = qa.url;
    } else {
      handleSend(qa.label);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating launcher button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#244B3A] text-white rounded-full shadow-xl hover:bg-[#1a372a] hover:scale-105 transition-smooth focus:outline-none focus:ring-2 focus:ring-[#244B3A] focus:ring-offset-2"
          aria-label="Open NFYVE Concierge Chat"
        >
          <MessageSquare className="w-5 h-5 text-white" />
          <span className="text-xs font-semibold tracking-wide uppercase">Concierge</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </button>
      )}

      {/* Expandable chat panel */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[380px] h-[520px] bg-[#FAF9F5] rounded-2xl shadow-2xl border border-[#DDD9CE] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-[#244B3A] text-white px-4 py-3.5 flex items-center justify-between border-b border-[#1b392c]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#32614b] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-[#A8B8A0]" />
              </div>
              <div>
                <h4 className="text-xs font-semibold tracking-wide">NFYVE Concierge</h4>
                <p className="text-[10px] text-[#A8B8A0]">Begumpet Sanctuary Support</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#C5C9BF] hover:text-white rounded-md hover:bg-[#32614b] transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-[#C5C9BF] hover:text-white rounded-md hover:bg-[#32614b] transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF9F5]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-[#E5E2D6] text-[#244B3A] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className="max-w-[80%] space-y-2">
                  <div
                    className={`p-3 text-xs leading-relaxed rounded-xl shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#244B3A] text-white rounded-tr-none'
                        : 'bg-white text-[#252923] border border-[#E7E5DC] rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Quick actions chips */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(qa)}
                          className="text-[11px] font-medium text-[#244B3A] bg-[#F0EEE5] hover:bg-[#E4E0D2] border border-[#DDD9CE] px-2.5 py-1 rounded-md transition-smooth text-left"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-[#244B3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-[#777A70] pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244B3A] animate-ping"></span>
                <span>Concierge is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input strip */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-[#E7E5DC] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about treatments, slots, or timings..."
              className="flex-1 text-xs bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg px-3 py-2 text-[#252923] focus:outline-none focus:border-[#244B3A] focus:ring-1 focus:ring-[#244B3A]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2 bg-[#244B3A] text-white rounded-lg hover:bg-[#1a372a] disabled:opacity-50 transition-smooth"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
