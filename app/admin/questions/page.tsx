'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, X, Check } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  category: string;
  weight: number;
}

export default function AdminQuestionsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const fetchQ = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) router.push('/admin/login');
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') fetchQ();
  }, [isAuthenticated, user, fetchQ]);

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const res = await fetch('/api/admin/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText, category: newCategory || 'Umum', weight: 1 }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions([...questions, data.question]);
      setNewText('');
      setNewCategory('');
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    if (res.ok) setQuestions(questions.filter(q => q.id !== id));
  };

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditText(q.text);
    setEditCategory(q.category);
  };

  const handleEdit = async () => {
    if (!editingId || !editText.trim()) return;
    const res = await fetch(`/api/admin/questions/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: editText, category: editCategory }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestions(questions.map(q => q.id === editingId ? data.question : q));
      setEditingId(null);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Manajemen Pertanyaan</h1>
          <p className="text-slate-500 mt-2">Atur daftar pertanyaan kuesioner.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center text-slate-500">Memuat...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">No</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Pertanyaan</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Kategori</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {questions.map((q, idx) => (
                <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500">{idx + 1}</td>
                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {editingId === q.id ? (
                      <input value={editText} onChange={e => setEditText(e.target.value)}
                        className="w-full p-2 border rounded-lg" />
                    ) : q.text}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === q.id ? (
                      <input value={editCategory} onChange={e => setEditCategory(e.target.value)}
                        className="w-32 p-2 border rounded-lg" />
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{q.category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {editingId === q.id ? (
                        <>
                          <button onClick={handleEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Tambah Pertanyaan Baru</h2>
            <textarea className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 mb-4"
              placeholder="Ketik pertanyaan..." value={newText} onChange={e => setNewText(e.target.value)} />
            <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              placeholder="Kategori (opsional)" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={handleAdd} className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
