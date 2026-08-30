'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Sparkles, User, Minimize2 } from 'lucide-react';
import { askGeminiAction } from '@/lib/ai/chat';
import { checkActiveOrganizationAction } from '@/lib/ai/actions';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

function FormatInlineText({ text }: { text: string }) {
  // Regex untuk bold (**text**), italic (*text*), dan inline code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={i} className="italic">{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={i} className="px-1 py-0.5 bg-gray-100 text-pink-600 rounded text-[12px] font-mono">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      })}
    </>
  );
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-1" />;

        // Header 3 / 2 / 1
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-bold text-gray-900 text-sm mt-2 mb-1">
              <FormatInlineText text={trimmed.replace(/^###\s+/, '')} />
            </h4>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="font-bold text-gray-900 text-base mt-2 mb-1">
              <FormatInlineText text={trimmed.replace(/^##\s+/, '')} />
            </h3>
          );
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={lineIdx} className="font-bold text-gray-900 text-lg mt-2 mb-1">
              <FormatInlineText text={trimmed.replace(/^#\s+/, '')} />
            </h2>
          );
        }

        // Bullet point (* atau -)
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={lineIdx} className="flex gap-2 items-start pl-1">
              <span className="text-blue-500 font-bold">•</span>
              <div className="flex-1">
                <FormatInlineText text={trimmed.replace(/^[-*]\s+/, '')} />
              </div>
            </div>
          );
        }

        // Numbered list (e.g. 1. 2.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={lineIdx} className="flex gap-1.5 items-start pl-1">
              <span className="font-medium text-blue-600 text-xs mt-0.5">{numMatch[1]}.</span>
              <div className="flex-1">
                <FormatInlineText text={numMatch[2]} />
              </div>
            </div>
          );
        }

        // Quote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={lineIdx} className="border-l-2 border-blue-400 pl-2.5 py-0.5 text-gray-600 italic bg-blue-50/50 rounded-r">
              <FormatInlineText text={trimmed.replace(/^>\s+/, '')} />
            </blockquote>
          );
        }

        // Normal paragraph
        return (
          <p key={lineIdx}>
            <FormatInlineText text={line} />
          </p>
        );
      })}
    </div>
  );
}

export default function AIChatBubble() {
  const [hasActiveOrg, setHasActiveOrg] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya asisten AI toko Anda. Ada yang bisa saya bantu terkait laporan penjualan atau analisis toko?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    async function verifyOrganization() {
      const active = await checkActiveOrganizationAction();
      setHasActiveOrg(active);
    }
    verifyOrganization();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Format riwayat pesan sebelumnya (kecuali pesan sambutan 'welcome')
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          text: m.text,
        }));

      const response = await askGeminiAction(trimmedInput, history);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.success
          ? response.text || 'Maaf, tidak ada tanggapan.'
          : response.text || 'Terjadi kesalahan saat memproses permintaan.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Maaf, sistem mengalami kendala koneksi. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!hasActiveOrg) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Modal Dialog Chat */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:mb-4 w-full h-full sm:w-[400px] sm:h-[520px] bg-white sm:rounded-2xl shadow-2xl border-0 sm:border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">Asisten AI Trafina</h3>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-white/20 transition text-white/90 hover:text-white cursor-pointer"
              title="Tutup Chat"
            >
              <X className="w-5 h-5 sm:hidden" />
              <Minimize2 className="w-4 h-4 hidden sm:block" />
            </button>
          </div>

          {/* Area Pesan */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[88%] sm:max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      msg.text
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-gray-400 mt-1 block ${
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto items-center">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0 pb-safe"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu ke AI..."
              className="flex-1 px-3.5 py-2.5 sm:py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-gray-800 placeholder-gray-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-xl transition shadow-sm flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Bubble Trigger Button (Pojok Kanan Bawah) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center relative group"
        aria-label="Toggle AI Chat"
      >
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200" />
        ) : (
          <>
            <Bot className="w-6 h-6 transition-transform duration-200" />
          </>
        )}
      </button>
    </div>
  );
}
