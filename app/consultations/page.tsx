'use client';

import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, ArrowLeft, Bot, MessageSquare, Plus, User, Shield, Clock } from 'lucide-react';
import Link from 'next/link';

type TabType = 'chatbot' | 'chat';

interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'user' | 'admin';
  message: string;
  createdAt: string;
}

interface ConsultationItem {
  id: string;
  message: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
}

export default function ConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('chatbot');

  
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);
  const [newChatTopic, setNewChatTopic] = useState('');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevMsgCountRef = useRef<number>(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

  
  useEffect(() => {
    if (!isAuthenticated) return;
    const existingScript = document.querySelector('script[src*="zapier-interfaces"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
      script.type = 'module';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isAuthenticated]);

  
  const fetchConsultations = useCallback(async () => {
    try {
      const res = await fetch('/api/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
      }
    } catch {  } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'chat') {
      fetchConsultations();
    }
  }, [isAuthenticated, activeTab, fetchConsultations]);

  
  const fetchMessages = useCallback(async (consultationId: string) => {
    try {
      const res = await fetch(`/api/consultations/${consultationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {  }
  }, []);

  
  useEffect(() => {
    if (selectedId && activeTab === 'chat') {
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
  }, [selectedId, activeTab, fetchMessages]);




  if (isLoading || !isAuthenticated) return null;

  const handleSelectConsultation = (id: string) => {
    setSelectedId(id);
    setMessages([]);
  };

  const handleCreateChat = async () => {
    if (!newChatTopic.trim()) return;
    setCreatingChat(true);
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newChatTopic, name: user?.name, email: user?.email }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewChatTopic('');
        setShowNewChatForm(false);
        await fetchConsultations();
        setSelectedId(data.consultation.id);
      }
    } catch {  } finally {
      setCreatingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedId) return;
    setSending(true);
    try {
      const res = await fetch(`/api/consultations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage }),
      });
      if (res.ok) {
        setNewMessage('');
        await fetchMessages(selectedId);
      }
    } catch {  } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const statusLabel: Record<string, string> = {
    new: 'Baru',
    in_progress: 'Aktif',
    done: 'Selesai',
  };

  const statusColor: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-emerald-100 text-emerald-700',
    done: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Konsultasi</h1>
        <p className="text-muted-foreground mt-2 text-lg">Pilih cara konsultasi yang paling nyaman untuk Anda.</p>
      </div>

      
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('chatbot')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === 'chatbot'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
            }`}
          >
            <Bot className="w-4.5 h-4.5" />
            Chatbot AI
            {activeTab === 'chatbot' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === 'chat'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            Chat Admin
            {activeTab === 'chat' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        
        <div>
          
          {activeTab === 'chatbot' && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-foreground">Asisten Konsultasi AI</h2>
                  <p className="text-sm text-muted-foreground">Dapatkan respons instan untuk keluhan Anda.</p>
                </div>
              </div>
              <div className="w-full rounded-xl overflow-hidden border border-border"
                dangerouslySetInnerHTML={{
                  __html: `<zapier-interfaces-chatbot-embed is-popup="false" chatbot-id="cmomevos8005le1he077exwlw" height="550px" width="100%"></zapier-interfaces-chatbot-embed>`
                }}
              />
            </div>
          )}

          
          {activeTab === 'chat' && (
            <div className="flex" style={{ height: '600px' }}>
              
              <div className="w-72 border-r border-border flex flex-col bg-slate-50/50 shrink-0">
                <div className="p-4 border-b border-border">
                  <button
                    onClick={() => setShowNewChatForm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Chat Baru
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingChats ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Memuat...</div>
                  ) : consultations.length === 0 ? (
                    <div className="p-6 text-center">
                      <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Belum ada chat.</p>
                      <p className="text-xs text-muted-foreground mt-1">Klik &quot;Chat Baru&quot; untuk mulai.</p>
                    </div>
                  ) : (
                    consultations.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelectConsultation(c.id)}
                        className={`w-full text-left px-4 py-3.5 border-b border-border/50 transition-colors ${
                          selectedId === c.id
                            ? 'bg-primary/10 border-l-2 border-l-primary'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>
                            {statusLabel[c.status]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{formatDate(c.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground truncate leading-snug">{c.message}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>

              
              <div className="flex-1 flex flex-col min-w-0">
                {showNewChatForm ? (
                  
                  <div className="flex-1 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="font-bold text-lg text-foreground">Mulai Chat Baru</h3>
                        <p className="text-sm text-muted-foreground mt-1">Jelaskan topik yang ingin Anda konsultasikan.</p>
                      </div>
                      <textarea
                        value={newChatTopic}
                        onChange={(e) => setNewChatTopic(e.target.value)}
                        placeholder="Contoh: Saya merasa cemas akhir-akhir ini dan sulit tidur..."
                        className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-32 text-sm"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowNewChatForm(false); setNewChatTopic(''); }}
                          className="flex-1 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-slate-50 transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleCreateChat}
                          disabled={creatingChat || !newChatTopic.trim()}
                          className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {creatingChat ? 'Membuat...' : 'Mulai Chat'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : selectedId ? (
                  
                  <>
                    
                    <div className="px-5 py-3.5 border-b border-border bg-white flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                        <Shield className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-foreground">Tim Konselor</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                          Online
                        </p>
                      </div>
                    </div>

                    
                    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/30">
                      {loadingMessages ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-sm text-muted-foreground">Memuat pesan...</div>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <Clock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">Belum ada pesan.</p>
                            <p className="text-xs text-muted-foreground mt-1">Kirim pesan pertama Anda!</p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex items-end gap-2 max-w-[75%] ${msg.senderRole === 'user' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                msg.senderRole === 'user'
                                  ? 'bg-primary/10'
                                  : 'bg-gradient-to-br from-emerald-100 to-teal-50'
                              }`}>
                                {msg.senderRole === 'user'
                                  ? <User className="w-3.5 h-3.5 text-primary" />
                                  : <Shield className="w-3.5 h-3.5 text-emerald-600" />
                                }
                              </div>
                              <div className={`rounded-2xl px-4 py-2.5 ${
                                msg.senderRole === 'user'
                                  ? 'bg-primary text-white rounded-br-md'
                                  : 'bg-white border border-border text-foreground rounded-bl-md shadow-sm'
                              }`}>
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                <p className={`text-[10px] mt-1.5 ${
                                  msg.senderRole === 'user' ? 'text-white/60' : 'text-muted-foreground'
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

                    
                    <div className="px-4 py-3 border-t border-border bg-white">
                      <div className="flex items-end gap-2">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ketik pesan..."
                          rows={1}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm max-h-24"
                          style={{ minHeight: '42px' }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sending || !newMessage.trim()}
                          className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          <Send className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-primary/40" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Chat dengan Admin</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">Pilih chat dari daftar di samping atau buat chat baru untuk memulai konsultasi.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      
      <div className="mt-6 bg-primary/5 p-5 rounded-2xl border border-primary/20">
        <h3 className="font-semibold text-sm text-primary mb-2">Panduan Konsultasi</h3>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>• Jelaskan keluhan Anda sejelas mungkin.</li>
          <li>• Tim profesional akan merespons dalam 1x24 jam kerja.</li>
          <li>• Untuk keadaan darurat, hubungi <strong>119 ext 8</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
