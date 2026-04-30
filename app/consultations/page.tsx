'use client';

import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isLoading]);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-foreground">Konsultasi</h1>
        <p className="text-muted-foreground mt-2 text-lg">Kirim pesan untuk memulai sesi konsultasi dengan tenaga profesional kami.</p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800 mb-2">Konsultasi Terkirim!</h2>
          <p className="text-green-700 mb-6">Tim kami akan segera meninjau permintaan Anda dan menghubungi Anda.</p>
          <button onClick={() => setSuccess(false)} className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Kirim Lagi
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nama</label>
              <input type="text" value={user?.name || ''} disabled
                className="w-full px-4 py-3 rounded-lg border border-border bg-slate-50 text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <input type="email" value={user?.email || ''} disabled
                className="w-full px-4 py-3 rounded-lg border border-border bg-slate-50 text-muted-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Pesan Konsultasi <span className="text-red-500">*</span></label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-40"
                placeholder="Ceritakan keluhan atau hal yang ingin Anda konsultasikan..." required />
            </div>
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            <button type="submit" disabled={sending || !message.trim()}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {sending ? 'Mengirim...' : <><Send className="w-4 h-4" /> Kirim Konsultasi</>}
            </button>
          </form>
        </div>
      )}

      <div className="mt-8 bg-primary/5 p-6 rounded-2xl border border-primary/20">
        <h3 className="font-semibold text-lg text-primary mb-3">Panduan Konsultasi</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Jelaskan keluhan Anda sejelas mungkin.</li>
          <li>• Tim profesional akan merespons dalam 1x24 jam kerja.</li>
          <li>• Untuk keadaan darurat, hubungi 119 ext 8.</li>
        </ul>
      </div>
    </div>
  );
}
