'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Clock, MessageSquare, Send, User, Shield } from 'lucide-react';
import Link from 'next/link';

interface Consultation {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
}

interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  message: string;
  createdAt: string;
}

export default function AdminConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/admin/login');
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') fetchData();
  }, [isAuthenticated, user, fetchData]);

  // Fetch messages
  const fetchMessages = useCallback(async (consultationId: string) => {
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch { /* silent */ }
  }, []);

  // Polling for new messages
  useEffect(() => {
    if (selectedId) {
      setLoadingMessages(true);
      fetchMessages(selectedId).finally(() => setLoadingMessages(false));

      pollingRef.current = setInterval(() => {
        fetchMessages(selectedId);
      }, 3000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [selectedId, fetchMessages]);




  if (isLoading || !isAuthenticated || user?.role !== 'admin') return null;

  const handleSelectConsultation = (id: string) => {
    setSelectedId(id);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/consultations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        await fetchMessages(selectedId);
      }
    } catch { /* silent */ } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(prev => prev.map(c => c.id === id ? data.consultation : c));
      }
    } catch { /* silent */ } finally {
      setUpdatingStatus(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const selectedConsultation = consultations.find(c => c.id === selectedId);

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    new: { label: 'Baru', cls: 'bg-blue-100 text-blue-700', icon: <MessageSquare className="w-3 h-3" /> },
    in_progress: { label: 'Proses', cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    done: { label: 'Selesai', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Konsultasi</h1>
        <p className="text-slate-500 mt-2">Pantau dan kelola permintaan konsultasi dari pengguna.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : (
          <div className="flex" style={{ height: '650px' }}>
            {/* Sidebar - Consultation List */}
            <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50 shrink-0">
              <div className="px-5 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-sm text-slate-700">Daftar Konsultasi</h2>
                <p className="text-xs text-slate-400 mt-0.5">{consultations.length} konsultasi</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {consultations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Belum ada konsultasi.</p>
                  </div>
                ) : (
                  consultations.map((c) => {
                    const sc = statusConfig[c.status] || statusConfig.new;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectConsultation(c.id)}
                        className={`w-full text-left px-5 py-4 border-b border-slate-100 transition-colors ${
                          selectedId === c.id
                            ? 'bg-blue-50 border-l-2 border-l-blue-500'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-medium text-sm text-slate-800 truncate max-w-[140px]">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-2">{c.message}</p>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.cls}`}>
                            {sc.icon} {sc.label}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{c.email}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {selectedId && selectedConsultation ? (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center shrink-0">
                        <User className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-slate-800 truncate">{selectedConsultation.name}</h3>
                        <p className="text-xs text-slate-400 truncate">{selectedConsultation.email}</p>
                      </div>
                    </div>
                    <select
                      value={selectedConsultation.status}
                      disabled={updatingStatus}
                      onChange={(e) => updateStatus(selectedId, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="new">Baru</option>
                      <option value="in_progress">Proses</option>
                      <option value="done">Selesai</option>
                    </select>
                  </div>

                  {/* Initial Message (topic) */}
                  <div className="px-5 py-3 bg-blue-50/50 border-b border-slate-100">
                    <p className="text-xs font-medium text-blue-700 mb-0.5">Topik Konsultasi:</p>
                    <p className="text-sm text-slate-700">{selectedConsultation.message}</p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/30">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-sm text-slate-400">Memuat pesan...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm text-slate-500">Belum ada pesan chat.</p>
                          <p className="text-xs text-slate-400 mt-1">Kirim balasan pertama kepada pengguna.</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[75%] ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                              msg.senderRole === 'admin'
                                ? 'bg-gradient-to-br from-emerald-100 to-teal-50'
                                : 'bg-gradient-to-br from-blue-100 to-indigo-50'
                            }`}>
                              {msg.senderRole === 'admin'
                                ? <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                : <User className="w-3.5 h-3.5 text-blue-600" />
                              }
                            </div>
                            <div className={`rounded-2xl px-4 py-2.5 ${
                              msg.senderRole === 'admin'
                                ? 'bg-emerald-600 text-white rounded-br-md'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                              <p className={`text-[10px] mt-1.5 ${
                                msg.senderRole === 'admin' ? 'text-white/60' : 'text-slate-400'
                              }`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="px-4 py-3 border-t border-slate-200 bg-white">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik balasan..."
                        rows={1}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none text-sm max-h-24"
                        style={{ minHeight: '42px' }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      >
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="font-semibold text-slate-700 mb-1">Pilih Konsultasi</h3>
                    <p className="text-sm text-slate-400 max-w-xs">Pilih konsultasi dari daftar di samping untuk melihat dan membalas pesan pengguna.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
