
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileCode } from 'lucide-react';
import { ChatMessage, Org } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface ChatInterfaceProps {
  activeOrg: Org | null;
  orgs: Org[];
  initialInput?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeOrg, orgs, initialInput }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I'm SalesforceDocBot. I've indexed your Objects, Apex, Flows, and Validation Rules. Ask me anything about your org configuration!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState(initialInput || '');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!activeOrg) {
      alert("Please connect and select an org first.");
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      orgId: activeOrg.id
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Gemini
    const responseText = await generateChatResponse(messages, userMsg.content, activeOrg.metadataSummary);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: responseText,
      timestamp: new Date(),
      orgId: activeOrg.id
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-slate-800">Assistant Chat</h2>
          <p className="text-xs text-slate-500">
            {activeOrg ? `Context: ${activeOrg.alias} (${activeOrg.type})` : 'No Org Context Selected'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-slate-400" />
                <span className="text-xs text-slate-500">Analyzing metadata index...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-100 bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask e.g., 'List validation rules on Opportunity' or 'How does the Onboarding flow work?'"
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-700"
            disabled={!activeOrg || isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!activeOrg || isTyping || !input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        {!activeOrg && (
          <p className="text-center text-xs text-red-400 mt-2">
            Connect an Org in the 'Connected Orgs' tab to enable chat.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
