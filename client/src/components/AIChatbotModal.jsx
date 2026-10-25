import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles, Send, Bot, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

const AIChatbotModal = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I'm your EventFlow AI Assistant. Ask me anything like 'Find free workshops' or 'Show tech events in Hyderabad'!"
    }
  ]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chatbot', { query: userText });
      const { reply, events } = res.data.data;

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          events: events || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I ran into an error querying events. Please try again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-base/80 backdrop-blur-md">
      <div className="bg-dark-card border border-purple-500/30 rounded-2xl max-w-lg w-full h-[520px] shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">EventFlow AI Assistant</h3>
              <p className="text-[10px] text-purple-300">Database-Powered Event Discovery</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl p-3 space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>

                {msg.events && msg.events.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    {msg.events.map(evt => (
                      <Link
                        key={evt.id}
                        to={`/events/${evt.id}`}
                        onClick={onClose}
                        className="block p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 group transition-all"
                      >
                        <div className="font-semibold text-brand-300 group-hover:text-brand-200 flex items-center justify-between">
                          <span>{evt.title}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(evt.startDate).toLocaleDateString()} • {evt.venue ? evt.venue.city : 'Online'}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-purple-300 italic">
              <Bot className="w-4 h-4 animate-bounce text-purple-400" />
              <span>AI is searching real event database...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            placeholder="Ask AI to find events..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl disabled:opacity-50 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatbotModal;
