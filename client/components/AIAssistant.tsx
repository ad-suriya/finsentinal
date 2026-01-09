import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import { createAIChat } from '../services/aiService';
import { useTransactions } from '../context/TransactionContext';

const sanitizeTxForChat = (txs: any[]) => {
  return txs.map(tx => ({
    id: tx.hashId,
    amount: tx.amount,
    status: tx.status,
    entity: tx.entity,
    riskScore: tx.score
  }));
};

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { transactions } = useTransactions();
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = createAIChat();
      setMessages([{ role: 'ai', text: 'VVFNT Intelligence Core online. How can I assist your investigation today?' }]);
    }
  }, [isOpen]);

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
      const safeContext = JSON.stringify(sanitizeTxForChat(transactions.slice(0, 5)));
      const contextPrompt = `[SYSTEM CONTEXT: Current Transactions: ${safeContext}] ${userText}`;
      const result = await chatRef.current.sendMessage({ message: contextPrompt });
      setMessages(prev => [...prev, { role: 'ai', text: result.text || 'No response from core.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to Intelligence Core lost.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-500/10 border border-cyan-400/30 rounded-lg">
                <Bot size={18} className="text-cyan-400" />
              </div>
              <span className="text-xs font-semibold text-cyan-300 tracking-wider">
                AI COMMAND INTERFACE
              </span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-cyan-300 transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/80 custom-scrollbar"
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cyan-500 text-slate-900 rounded-tr-none shadow-md'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150" />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Query intelligence core..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-4 pr-10 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition"
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
        className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-4 py-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        {isOpen ? <ChevronDown size={20} /> : <Bot size={20} />}
        <span className="text-sm font-bold pr-1">
          {isOpen ? 'Close Link' : 'Open AI Link'}
        </span>
        {!isOpen && <Sparkles size={14} className="animate-pulse" />}
      </button>
    </div>
  );
};

export default AIAssistant;
