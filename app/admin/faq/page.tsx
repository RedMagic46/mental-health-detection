'use client';

import { useAuthStore } from '../../store/useStore';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface Faq {
  id: number;
  question: string;
  answer: string;
  createdAt: string;
}

export default function AdminFaqPage() {
  const { user } = useAuthStore();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({ question: '', answer: '' });

  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [editForm, setEditForm] = useState({ question: '', answer: '' });

  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data FAQ.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.question.trim() || !newForm.answer.trim()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(prev => [...prev, data.faq]);
        setIsAddModalOpen(false);
        setNewForm({ question: '', answer: '' });
        setMessage({ type: 'success', text: 'FAQ baru berhasil ditambahkan.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal menambahkan FAQ.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq) return;
    if (!editForm.question.trim() || !editForm.answer.trim()) return;

    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(prev => prev.map(f => f.id === editingFaq.id ? data.faq : f));
        setEditingFaq(null);
        setMessage({ type: 'success', text: 'FAQ berhasil diperbarui.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal memperbarui FAQ.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) return;

    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setFaqs(prev => prev.filter(f => f.id !== id));
        setMessage({ type: 'success', text: 'FAQ berhasil dihapus.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.error || 'Gagal menghapus FAQ.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaq(faq);
    setEditForm({ question: faq.question, answer: faq.answer });
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen FAQ</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola pertanyaan yang sering diajukan pada landing page.</p>
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
            <Plus className="w-5 h-5" /> Tambah FAQ Baru
          </button>
        </div>
      </div>

      
      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center text-slate-500 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          Memuat data FAQ...
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-12 text-center text-slate-400">
          Belum ada data FAQ.
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-600 text-sm font-semibold">
                <th className="px-6 py-4 w-1/3">Pertanyaan</th>
                <th className="px-6 py-4">Jawaban</th>
                <th className="px-6 py-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800 align-top">{faq.question}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-pre-wrap align-top">{faq.answer}</td>
                  <td className="px-6 py-4 text-right align-top">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEditModal(faq)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Tambah FAQ Baru</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Buat FAQ baru untuk ditampilkan pada landing page publik.</p>

            <form onSubmit={handleAddFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pertanyaan</label>
                <input
                  type="text"
                  required
                  value={newForm.question}
                  onChange={(e) => setNewForm({ ...newForm, question: e.target.value })}
                  placeholder="Ketik pertanyaan di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jawaban</label>
                <textarea
                  required
                  rows={4}
                  value={newForm.answer}
                  onChange={(e) => setNewForm({ ...newForm, answer: e.target.value })}
                  placeholder="Ketik jawaban di sini..."
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
                  Simpan FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {editingFaq && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-slate-800">Ubah FAQ</h2>
              <button onClick={() => setEditingFaq(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-500 mb-6 text-xs">Ubah isi pertanyaan atau jawaban FAQ.</p>

            <form onSubmit={handleUpdateFaq} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Pertanyaan</label>
                <input
                  type="text"
                  required
                  value={editForm.question}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  placeholder="Ketik pertanyaan di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Jawaban</label>
                <textarea
                  required
                  rows={4}
                  value={editForm.answer}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                  placeholder="Ketik jawaban di sini..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingFaq(null)}
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
