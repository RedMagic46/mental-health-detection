'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Send, 
  User, 
  Shield, 
  FileText, 
  BookOpen, 
  Save, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import MoodChart from './MoodChart';

interface Consultation {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
  assignedConsultantId: string | null;
  internalNotes: string | null;
}

interface ChatMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'user' | 'admin' | 'consultant';
  message: string;
  createdAt: string;
}

interface ConsultantProfile {
  id: string;
  name: string;
  email: string;
}

interface AssessmentHistory {
  id: string;
  score: number;
  label: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
  createdAt: string;
}

interface ConsultationsPanelProps {
  isAdmin: boolean;
  currentUser: {
    id: string;
    name: string;
    role: 'admin' | 'consultant';
  };
}

export default function ConsultationsPanel({ isAdmin, currentUser }: ConsultationsPanelProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [consultants, setConsultants] = useState<ConsultantProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [internalNotesText, setInternalNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);
  
  
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [moodLogsData, setMoodLogsData] = useState<{ day: string; mood: number }[]>([]);
  const [loadingMood, setLoadingMood] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const prevLengthRef = useRef(0);

  
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
      }
    } catch {  } finally {
      setLoading(false);
    }
  }, []);

  const fetchConsultantsList = useCallback(async () => {
    try {
      const res = await fetch('/api/consultants');
      if (res.ok) {
        const data = await res.json();
        setConsultants(data.consultants || []);
      }
    } catch {  }
  }, []);

  useEffect(() => {
    fetchData();
    fetchConsultantsList();
  }, [fetchData, fetchConsultantsList]);

  
  const fetchMessages = useCallback(async (consultationId: string) => {
    try {
      const res = await fetch(`/api/admin/consultations/${consultationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {  }
  }, []);

  
  const fetchClientData = useCallback(async (userId: string) => {
    setLoadingHistory(true);
    setLoadingMood(true);
    try {
      const [histRes, moodRes] = await Promise.all([
        fetch(`/api/admin/users/${userId}/assessment-history`),
        fetch(`/api/admin/users/${userId}/mood-logs?limit=30`)
      ]);

      if (histRes.ok) {
        const histData = await histRes.json();
        setAssessmentHistory(histData.assessments || []);
      } else {
        setAssessmentHistory([]);
      }

      if (moodRes.ok) {
        const moodData = await moodRes.json();
        setMoodLogsData(moodData.chartData || []);
      } else {
        setMoodLogsData([]);
      }
    } catch {
      setAssessmentHistory([]);
      setMoodLogsData([]);
    } finally {
      setLoadingHistory(false);
      setLoadingMood(false);
    }
  }, []);

  
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

  
  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevLengthRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevLengthRef.current = messages.length;
    }
  }, [messages]);

  const selectedConsultation = consultations.find(c => c.id === selectedId);

  
  useEffect(() => {
    if (selectedConsultation) {
      setInternalNotesText(selectedConsultation.internalNotes || '');
      setSaveNotesSuccess(false);
      if (selectedConsultation.userId) {
        fetchClientData(selectedConsultation.userId);
      } else {
        setAssessmentHistory([]);
        setMoodLogsData([]);
      }
    }
  }, [selectedId, selectedConsultation, fetchClientData]);

  const handleSelectConsultation = (id: string) => {
    setSelectedId(id);
    setMessages([]);
    prevLengthRef.current = 0;
    setIsStatusOpen(false);
    setIsAssignOpen(false);
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
    } catch {  } finally {
      setUpdatingStatus(false);
    }
  };

  const assignConsultant = async (id: string, consultantId: string | null) => {
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedConsultantId: consultantId }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(prev => prev.map(c => c.id === id ? data.consultation : c));
      }
    } catch {  }
  };

  const handleSaveNotes = async () => {
    if (!selectedId) return;
    setSavingNotes(true);
    setSaveNotesSuccess(false);
    try {
      const res = await fetch(`/api/admin/consultations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internalNotes: internalNotesText }),
      });
      if (res.ok) {
        const data = await res.json();
        setConsultations(prev => prev.map(c => c.id === selectedId ? data.consultation : c));
        setSaveNotesSuccess(true);
        setTimeout(() => setSaveNotesSuccess(false), 3000);
      }
    } catch {  } finally {
      setSavingNotes(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getConsultantName = (consultantId: string | null) => {
    if (!consultantId) return null;
    const c = consultants.find(item => item.id === consultantId);
    return c ? c.name : 'Memuat...';
  };

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    new: { label: 'Baru', cls: 'bg-blue-50 text-blue-700 border-blue-100', icon: <MessageSquare className="w-3 h-3" /> },
    in_progress: { label: 'Proses', cls: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="w-3 h-3" /> },
    done: { label: 'Selesai', cls: 'bg-teal-50 text-teal-700 border-teal-100', icon: <CheckCircle className="w-3 h-3" /> },
  };

  const labelMap: Record<string, { text: string; cls: string }> = {
    normal: { text: 'Normal', cls: 'bg-green-100 text-green-700' },
    at_risk: { text: 'Berisiko', cls: 'bg-yellow-100 text-yellow-700' },
    critical: { text: 'Kritis', cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
      {loading ? (
        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-medium">Memuat data konsultasi...</p>
        </div>
      ) : (
        <div className="flex" style={{ height: '700px' }}>
          
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 shrink-0">
            <div className="px-5 py-4 border-b border-slate-100 bg-white">
              <h2 className="font-bold text-slate-800 text-sm">Daftar Konsultasi</h2>
              <p className="text-xs text-slate-400 mt-1">{consultations.length} total tiket</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {consultations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-500">Belum ada konsultasi.</p>
                  <p className="text-xs text-slate-400 mt-1">Daftar konsultasi yang masuk akan muncul di sini.</p>
                </div>
              ) : (
                consultations.map((c) => {
                  const sc = statusConfig[c.status] || statusConfig.new;
                  const consultantName = getConsultantName(c.assignedConsultantId);
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConsultation(c.id)}
                      className={`w-full text-left px-5 py-4 border-b border-slate-50 transition-all ${
                        selectedId === c.id
                          ? 'bg-secondary-fixed/30 border-l-4 border-l-primary'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-slate-800 truncate max-w-[130px]">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-2.5">{c.message}</p>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.cls}`}>
                            {sc.icon} {sc.label}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[130px]" title={c.email}>{c.email}</span>
                        </div>
                        {isAdmin && (
                          <div className="text-[10px] font-medium text-slate-500">
                            {consultantName ? (
                              <span className="text-primary font-semibold">Konsultan: {consultantName}</span>
                            ) : (
                              <span className="text-slate-400 italic">Belum di-assign</span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          
          <div className="flex-grow flex flex-col min-w-0 bg-slate-50/20">
            {selectedId && selectedConsultation ? (
              <>
                
                <div className="px-6 py-4 border-b border-slate-100 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-3 shadow-sm/5 z-10 shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-800 truncate">{selectedConsultation.name}</h3>
                      <p className="text-xs text-slate-400 font-medium truncate">{selectedConsultation.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 shrink-0 z-20">
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-medium">Status:</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setIsStatusOpen(!isStatusOpen);
                            setIsAssignOpen(false);
                          }}
                          disabled={updatingStatus}
                          className="flex items-center justify-between gap-1.5 text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-1.5 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm min-w-[95px] text-slate-700 disabled:opacity-50"
                        >
                          <span>
                            {selectedConsultation.status === 'new' ? 'Baru' : 
                             selectedConsultation.status === 'in_progress' ? 'Proses' : 'Selesai'}
                          </span>
                          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-90' : ''}`} />
                        </button>
                        
                        {isStatusOpen && (
                          <>
                            <div className="fixed inset-0 z-20" onClick={() => setIsStatusOpen(false)} />
                            <ul className="absolute left-0 mt-1.5 z-30 w-32 bg-white border border-slate-200/60 rounded-xl shadow-lg py-1.5">
                              {[
                                { value: 'new', label: 'Baru' },
                                { value: 'in_progress', label: 'Proses' },
                                { value: 'done', label: 'Selesai' }
                              ].map(item => (
                                <li key={item.value}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateStatus(selectedId, item.value);
                                      setIsStatusOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                                      selectedConsultation.status === item.value ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>{item.label}</span>
                                    {selectedConsultation.status === item.value && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>

                    
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
                        <span className="text-xs text-slate-400 font-medium">Assign:</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAssignOpen(!isAssignOpen);
                              setIsStatusOpen(false);
                            }}
                            className="flex items-center justify-between gap-1.5 text-xs font-bold border border-slate-200 rounded-xl px-3.5 py-1.5 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm min-w-[150px] text-slate-700"
                          >
                            <span className="truncate max-w-[110px]">
                              {selectedConsultation.assignedConsultantId 
                                ? getConsultantName(selectedConsultation.assignedConsultantId) 
                                : 'Belum di-assign'}
                            </span>
                            <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isAssignOpen ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {isAssignOpen && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setIsAssignOpen(false)} />
                              <ul className="absolute right-0 mt-1.5 z-30 w-48 bg-white border border-slate-200/60 rounded-xl shadow-lg py-1.5">
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      assignConsultant(selectedId, null);
                                      setIsAssignOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                                      !selectedConsultation.assignedConsultantId ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'
                                    }`}
                                  >
                                    <span>Belum di-assign</span>
                                    {!selectedConsultation.assignedConsultantId && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                                  </button>
                                </li>
                                {consultants.map(c => (
                                  <li key={c.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        assignConsultant(selectedId, c.id);
                                        setIsAssignOpen(false);
                                      }}
                                      className={`w-full text-left px-3.5 py-2 text-xs transition-colors hover:bg-slate-50 flex items-center justify-between ${
                                        selectedConsultation.assignedConsultantId === c.id ? 'text-primary font-bold bg-primary/5' : 'text-slate-600'
                                      }`}
                                    >
                                      <span className="truncate max-w-[120px]">{c.name}</span>
                                      {selectedConsultation.assignedConsultantId === c.id && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                
                <div className="px-6 py-4 bg-primary/5 border-b border-slate-100 shrink-0">
                  <span className="text-[10px] font-bold text-primary tracking-wider uppercase">Topik Pengaduan</span>
                  <p className="text-sm text-slate-700 mt-1 font-medium leading-relaxed">{selectedConsultation.message}</p>
                </div>

                
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/50">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-400 space-y-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                        <p className="text-xs font-medium">Memuat obrolan...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center bg-white p-6 rounded-2xl shadow-sm border border-slate-150 max-w-xs">
                        <MessageSquare className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                        <h4 className="text-sm font-bold text-slate-700">Mulai Obrolan</h4>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Kirim balasan chat pertama kepada klien ini untuk membantu konsultasi.</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      const isClient = msg.senderRole === 'user';
                      const isStaff = msg.senderRole === 'admin' || msg.senderRole === 'consultant';
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2.5 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                              isClient
                                ? 'bg-blue-100 border-blue-200 text-blue-600'
                                : msg.senderRole === 'admin'
                                  ? 'bg-indigo-100 border-indigo-200 text-indigo-600'
                                  : 'bg-amber-100 border-amber-200 text-amber-600'
                            }`}>
                              {isClient ? (
                                <User className="w-4 h-4" />
                              ) : msg.senderRole === 'admin' ? (
                                <Shield className="w-4 h-4" />
                              ) : (
                                <User className="w-4 h-4" />
                              )}
                            </div>
                            
                            <div className="flex flex-col">
                              {!isMe && (
                                <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1 capitalize">
                                  {msg.senderRole === 'consultant' ? 'Konsultan' : msg.senderRole}
                                </span>
                              )}
                              <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-primary text-white rounded-br-sm'
                                  : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-sm'
                              }`}>
                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                <p className={`text-[9px] mt-1.5 text-right font-medium ${
                                  isMe ? 'text-white/60' : 'text-slate-400'
                                }`}>
                                  {formatTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                
                <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0">
                  <div className="flex items-end gap-2.5">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ketik balasan untuk klien..."
                      rows={1}
                      className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm max-h-24 leading-relaxed"
                      style={{ minHeight: '44px' }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                      title="Kirim pesan"
                    >
                      {sending ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        <Send className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              
              <div className="flex-1 flex items-center justify-center bg-slate-50/20">
                <div className="text-center p-8 max-w-sm">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200/50">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-700 mb-1.5 text-base">Pilih Konsultasi</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">Pilih salah satu antrean tiket konsultasi di kolom kiri untuk mulai melayani klien dan melihat detail kesehatan mental mereka.</p>
                </div>
              </div>
            )}
          </div>

          
          {selectedId && selectedConsultation && (
            <div className="w-80 border-l border-slate-100 flex flex-col bg-white shrink-0">
              
              <div className="flex border-b border-slate-100 shrink-0 p-1 bg-slate-50/50 m-2 rounded-2xl">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'details'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" /> Detail Klien
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'notes'
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" /> Catatan Internal
                </button>
              </div>

              
              <div className="flex-grow overflow-y-auto p-4 min-h-0">
                {activeTab === 'details' ? (
                  
                  <div className="space-y-6">
                    {selectedConsultation.userId ? (
                      <>
                        
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <FileText className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Riwayat Skrining</h4>
                          </div>

                          {loadingHistory ? (
                            <div className="py-6 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : assessmentHistory.length === 0 ? (
                            <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                              Klien belum pernah mengisi skrining.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {assessmentHistory.map((hist) => {
                                const lm = labelMap[hist.label] || { text: hist.label, cls: 'bg-slate-100 text-slate-700' };
                                return (
                                  <div key={hist.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="font-bold text-slate-700">Skor: {hist.score}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${lm.cls}`}>{lm.text}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-2" title={hist.recommendation}>
                                      {hist.recommendation}
                                    </p>
                                    <span className="text-[8px] text-slate-400 mt-1.5 block font-medium">
                                      {new Date(hist.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        
                        <div className="border-t border-slate-100 pt-5">
                          <div className="flex items-center gap-1.5 mb-3">
                            <Activity className="w-4 h-4 text-primary" />
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mood Tracker (30 Hari)</h4>
                          </div>

                          {loadingMood ? (
                            <div className="py-12 flex items-center justify-center">
                              <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                          ) : moodLogsData.length === 0 ? (
                            <div className="p-4 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                              Klien belum pernah merekam mood harian.
                            </div>
                          ) : (
                            <div className="h-[220px] w-full text-xs">
                              
                              <MoodChart data={moodLogsData} />
                              <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-medium">
                                <span>1 = Buruk</span>
                                <span>3 = Biasa</span>
                                <span>5 = Baik</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      
                      <div className="text-center p-6 bg-slate-50 border border-slate-200/50 rounded-2xl flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-700">Klien Non-Anggota</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">Konsultasi ini diajukan tanpa login akun. Riwayat skrining dan mood log hanya tersedia untuk pengguna terdaftar.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  
                  <div className="flex flex-col h-full space-y-4">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Catatan Staf Internal</h4>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Tulis catatan penting per tiket konsultasi di sini. Catatan ini bersifat internal dan **hanya bisa dilihat oleh Admin dan Konsultan yang di-assign** (tidak visible ke klien).
                    </p>
                    
                    <div className="flex-1 flex flex-col min-h-[200px]">
                      <textarea
                        value={internalNotesText}
                        onChange={(e) => setInternalNotesText(e.target.value)}
                        placeholder="Tulis diagnosa, riwayat singkat, atau rencana tindak lanjut..."
                        className="flex-grow w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-xs transition-all resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex items-center justify-between shrink-0">
                      {saveNotesSuccess ? (
                        <span className="text-[10px] font-bold text-teal-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Tersimpan!
                        </span>
                      ) : (
                        <span />
                      )}
                      
                      <button
                        onClick={handleSaveNotes}
                        disabled={savingNotes}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingNotes ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="w-3.5 h-3.5" />
                            Simpan Catatan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
