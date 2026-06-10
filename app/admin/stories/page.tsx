'use client';

import { useAuthStore } from '../../store/useStore';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Star, Loader2 } from 'lucide-react';

interface SuccessStory {
  id: number;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  rating: number;
  createdAt: string;
}

export default function AdminStoriesPage() {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', authorName: '', authorRole: 'Pengguna', rating: 5 });

  const [editingStory, setEditingStory] = useState<SuccessStory | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', authorName: '', authorRole: 'Pengguna', rating: 5 });

  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stories');
      if (res.ok) {
        const data = await res.json();
        setStories(data.stories || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat cerita sukses.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.title.trim() || !newForm.content.trim() || !newForm.authorName.trim()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      if (res.ok) {
        const data = await res.json();
        setStories(prev => [data.story, ...prev]);
        setIsAddModalOpen(false);
        setNewForm({ title: '', content: '', authorName: '', authorRole: 'Pengguna', rating: 5 });
        setMessage({ type: 'success', text: 'Cerita sukses baru berhasil ditambahkan.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal menambahkan cerita.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStory) return;
    if (!editForm.title.trim() || !editForm.content.trim() || !editForm.authorName.trim()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/stories/${editingStory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        setStories(prev => prev.map(s => s.id === editingStory.id ? data.story : s));
        setEditingStory(null);
        setMessage({ type: 'success', text: 'Cerita sukses berhasil diperbarui.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal memperbarui cerita.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStory = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus cerita sukses ini secara permanen?')) return;

    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/stories/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStories(prev => prev.filter(s => s.id !== id));
        setMessage({ type: 'success', text: 'Cerita sukses berhasil dihapus.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal menghapus cerita.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
  };

  const openEditModal = (story: SuccessStory) => {
    setEditingStory(story);
    setEditForm({
      title: story.title,
      content: story.content,
      authorName: story.authorName,
      authorRole: story.authorRole,
      rating: story.rating,
    });
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Cerita Sukses</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola ulasan dan cerita sukses pemulihan pengguna di landing page.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Tambah Cerita Baru
          </button>
        </div>
      </div>

      
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center text-slate-500 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          Memuat data cerita...
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          Belum ada data cerita sukses.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <div 
              key={story.id} 
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{story.title}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Oleh <span className="font-semibold text-slate-600">{story.authorName}</span> ({story.authorRole})
                    </p>
                  </div>
                  <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold gap-1 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-yellow-500" /> {story.rating}
                  </div>
                </div>
                <p className="text-xs text-slate-500 whitespace-pre-wrap mb-6 leading-relaxed line-clamp-4" title={story.content}>
                  {"\""}{story.content}{"\""}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(story)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-primary hover:border-primary rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteStory(story.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Tambah Cerita Sukses</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Buat ulasan cerita sukses baru untuk dipajang pada landing page.</p>

            <form onSubmit={handleAddStory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Penulis</label>
                  <input
                    type="text"
                    required
                    value={newForm.authorName}
                    onChange={(e) => setNewForm({ ...newForm, authorName: e.target.value })}
                    placeholder="Contoh: Rina A."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Peranan Penulis</label>
                  <input
                    type="text"
                    required
                    value={newForm.authorRole}
                    onChange={(e) => setNewForm({ ...newForm, authorRole: e.target.value })}
                    placeholder="Contoh: Pengguna Tes"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Judul Ulasan</label>
                  <input
                    type="text"
                    required
                    value={newForm.title}
                    onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                    placeholder="Contoh: Sangat terbantu"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rating (1-5)</label>
                  <select
                    value={newForm.rating}
                    onChange={(e) => setNewForm({ ...newForm, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Bintang</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Isi Cerita</label>
                <textarea
                  required
                  rows={4}
                  value={newForm.content}
                  onChange={(e) => setNewForm({ ...newForm, content: e.target.value })}
                  placeholder="Ketik detail cerita sukses di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md text-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Cerita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {editingStory && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Ubah Cerita Sukses</h2>
              <button onClick={() => setEditingStory(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Ubah detail cerita ulasan sukses.</p>

            <form onSubmit={handleUpdateStory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Penulis</label>
                  <input
                    type="text"
                    required
                    value={editForm.authorName}
                    onChange={(e) => setEditForm({ ...editForm, authorName: e.target.value })}
                    placeholder="Contoh: Rina A."
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Peranan Penulis</label>
                  <input
                    type="text"
                    required
                    value={editForm.authorRole}
                    onChange={(e) => setEditForm({ ...editForm, authorRole: e.target.value })}
                    placeholder="Contoh: Pengguna Tes"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Judul Ulasan</label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    placeholder="Contoh: Sangat terbantu"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rating (1-5)</label>
                  <select
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) || 5 })}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm cursor-pointer"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r}>{r} Bintang</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Isi Cerita</label>
                <textarea
                  required
                  rows={4}
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  placeholder="Ketik detail cerita sukses di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-5 py-2.5 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-md text-sm flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
