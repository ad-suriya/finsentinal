import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import { useTransactions } from '../context/TransactionContext';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { transactions } = useTransactions();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: 'ai', text: 'Fin Sentinel Intelligence Core online. How can I assist your investigation today?' }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const reply = await sendChatMessage(userText, messages, transactions);
      setMessages(prev => [...prev, { role: 'ai', text: reply || 'No response from core.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to Intelligence Core lost.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-[#F0F7F4] border border-[#D1FAE5] rounded-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="bg-[#F0F7F4] p-4 border-b border-[#D1FAE5] flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg">
                <Bot size={18} className="text-[#10B981]" />
              </div>
              <span className="text-xs font-semibold text-[#064E3B] tracking-wide">
                AI COMMAND INTERFACE
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#64748B] hover:text-[#059669] transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F0F7F4]"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#10B981] text-white rounded-tr-none'
                      : 'bg-white text-[#64748B] border border-[#D1FAE5] rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#D1FAE5] p-3 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#D1FAE5]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query intelligence core..."
                className="w-full bg-white border border-[#D1FAE5] rounded-xl py-2 pl-4 pr-10 text-xs text-[#064E3B] focus:outline-none focus:ring-1 focus:ring-[#10B981] placeholder:text-[#94A3B8]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#10B981] hover:text-[#059669] transition"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-3 rounded-full transition-all active:scale-95"
      >
        {isOpen ? <ChevronDown size={20} /> : <Bot size={20} />}
        <span className="text-sm font-semibold pr-1">
          {isOpen ? 'Close Link' : 'Open AI Link'}
        </span>
        {!isOpen && <Sparkles size={14} className="animate-pulse" />}
      </button>
    </div>
  );
};

export default AIAssistant;
