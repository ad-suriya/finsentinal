
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Terminal, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { createAIChat } from '../services/aiService';
import { useTransactions } from '../context/TransactionContext';

// Helper to sanitize specifically for the chat context
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
      // Feed sanitized context of recent transactions to the chat to avoid circular errors
      const safeContext = JSON.stringify(sanitizeTxForChat(transactions.slice(0, 5)));
      const contextPrompt = `[SYSTEM CONTEXT: Current Transactions: ${safeContext}] ${userText}`;
      const result = await chatRef.current.sendMessage({ message: contextPrompt });
      setMessages(prev => [...prev, { role: 'ai', text: result.text || 'No response from core.' }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Error: Connection to Intelligence Core lost. Please check API configuration.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-background p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg">
                <Bot size={18} className="text-white" />
              </div>
              <span className="text-sm font-bold text-primary-text tracking-tight">AI Command Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-background text-secondary-text border border-border rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-background border border-border p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 bg-background border-t border-border">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about threats..."
                className="w-full bg-surface border border-border rounded-xl py-2 pl-4 pr-10 text-xs text-primary-text focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80">
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-full shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95"
      >
        {isOpen ? <ChevronDown size={20} /> : <Bot size={20} />}
        <span className="text-sm font-bold pr-1">{isOpen ? 'Close Link' : 'Open AI Link'}</span>
        {!isOpen && <Sparkles size={14} className="animate-pulse" />}
      </button>
    </div>
  );
};

export default AIAssistant;
