'use client';

import { useAuthStore } from '../../store/useStore';
import { useEffect, useState, useCallback } from 'react';
import { Trash2, Search, MessageSquare, Heart, ShieldAlert, Loader2 } from 'lucide-react';

interface ForumThread {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  userName: string;
  isAnonymous: boolean;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export default function AdminForumPage() {
  const { user } = useAuthStore();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchThreads = useCallback(async () => {
    try {
      const res = await fetch('/api/forum');
      if (res.ok) {
        const data = await res.json();
        setThreads(data.threads || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat daftar forum.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus diskusi ini secara permanen beserta seluruh komentarnya?')) return;
    
    setDeletingId(id);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/forum/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setThreads(prev => prev.filter(t => t.id !== id));
        setMessage({ type: 'success', text: 'Diskusi berhasil dihapus.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal menghapus diskusi.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredThreads = threads.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Forum</h1>
          <p className="text-slate-500 mt-1 text-sm">Pantau diskusi publik dan hapus postingan yang melanggar ketentuan.</p>
        </div>
        {message.text && (
          <div
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${
              message.type === 'success'
                ? 'bg-teal-50 text-teal-700 border-teal-100'
                : 'bg-red-50 text-red-700 border-red-100'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari kata kunci diskusi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Menampilkan {filteredThreads.length} dari {threads.length} total diskusi
        </div>
      </div>

      
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center text-slate-500 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          Memuat daftar diskusi...
        </div>
      ) : filteredThreads.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          Tidak ada diskusi yang ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredThreads.map((t) => (
            <div 
              key={t.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row justify-between md:items-center gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {t.category}
                  </span>
                  {t.isAnonymous && (
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Anonim (Publik)
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    Diposting oleh <span className="font-semibold text-slate-600">{t.userName}</span> pada {new Date(t.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base">{t.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{t.content}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-slate-400" /> {t.likesCount} suka</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4 text-slate-400" /> {t.commentsCount} komentar</span>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Hapus Diskusi"
                >
                  {deletingId === t.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
