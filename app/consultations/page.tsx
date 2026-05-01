'use client';

import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Send, CheckCircle2, ArrowLeft, Bot, MessageSquare } from 'lucide-react';
import Link from 'next/link';

type TabType = 'chatbot' | 'form';

export default function ConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('chatbot');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

  // Load Zapier chatbot script
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

  if (isLoading || !isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, name: user?.name, email: user?.email }),
      });
      if (res.ok) {
        setSuccess(true);
        setMessage('');
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mengirim konsultasi.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Konsultasi</h1>
        <p className="text-muted-foreground mt-2 text-lg">Pilih cara konsultasi yang paling nyaman untuk Anda.</p>
      </div>

      {/* Unified Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        {/* Tab Navigation */}
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
            onClick={() => setActiveTab('form')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-semibold transition-all relative ${
              activeTab === 'form'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            Kirim Pesan
            {activeTab === 'form' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {/* Chatbot Tab */}
          {activeTab === 'chatbot' && (
            <div>
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

          {/* Form Tab */}
          {activeTab === 'form' && (
            <div>
              {success ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-10 text-center">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">Konsultasi Terkirim!</h2>
                  <p className="text-green-700 mb-6">Tim kami akan segera meninjau permintaan Anda dan menghubungi Anda.</p>
                  <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Kirim Lagi
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-foreground">Kirim ke Tim Profesional</h2>
                      <p className="text-sm text-muted-foreground">Pesan Anda akan ditinjau oleh tenaga ahli kami.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Nama</label>
                      <input type="text" value={user?.name || ''} disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-slate-50 text-muted-foreground text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input type="email" value={user?.email || ''} disabled
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-slate-50 text-muted-foreground text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Pesan Konsultasi <span className="text-red-500">*</span></label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-44 text-sm"
                      placeholder="Ceritakan keluhan atau hal yang ingin Anda konsultasikan..." required />
                  </div>
                  {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                  <button type="submit" disabled={sending || !message.trim()}
                    className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm">
                    {sending ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Konsultasi</>}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Panduan */}
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

