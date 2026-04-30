'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, ArrowLeft, X, Check, Settings, Save, RefreshCw, List, Hash, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  category: string;
  weight: number;
}

interface Config {
  displayCount: number;
  selectionMode: 'manual' | 'random';
  manualQuestionIds: number[];
  randomizeOrder: boolean;
}

export default function AdminQuestionsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('');
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      const [qRes, cRes] = await Promise.all([
        fetch('/api/admin/questions'),
        fetch('/api/admin/settings')
      ]);
      
      if (qRes.ok && cRes.ok) {
        const qData = await qRes.json();
        const cData = await cRes.json();
        setQuestions(qData.questions);
        setConfig(cData.config);
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
    if (!confirm('Hapus pertanyaan ini?')) return;
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

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Konfigurasi kuis disimpan.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan konfigurasi.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleManualQuestion = (id: number) => {
    if (!config) return;
    const newManualIds = config.manualQuestionIds.includes(id)
      ? config.manualQuestionIds.filter(qId => qId !== id)
      : [...config.manualQuestionIds, id];
    setConfig({ ...config, manualQuestionIds: newManualIds });
  };

  if (isLoading || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      <div className="flex justify-between items-center">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
        {message.text && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      {/* SECTION: CONFIGURATION */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" /> Konfigurasi Kuis
            </h2>
            <p className="text-sm text-slate-500 mt-1">Atur jumlah dan cara pertanyaan ditampilkan kepada user.</p>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={saving || !config}
            className="bg-primary text-white px-5 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Konfigurasi
          </button>
        </div>

        {config && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Jumlah Pertanyaan Tampil
              </label>
              <input
                type="number"
                value={config.displayCount}
                onChange={(e) => setConfig({ ...config, displayCount: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                min="1"
                max={questions.length}
              />
              <p className="text-[11px] text-slate-400">Total tersedia: {questions.length} pertanyaan.</p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Metode Pemilihan
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setConfig({ ...config, selectionMode: 'random' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    config.selectionMode === 'random' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Acak (Random)
                </button>
                <button
                  onClick={() => setConfig({ ...config, selectionMode: 'manual' })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    config.selectionMode === 'manual' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Manual (Pilih)
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Acak Urutan
              </label>
              <div className="flex items-center gap-3 h-10">
                <button
                  onClick={() => setConfig({ ...config, randomizeOrder: !config.randomizeOrder })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${config.randomizeOrder ? 'bg-primary' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.randomizeOrder ? 'left-7' : 'left-1'}`} />
                </button>
                <span className="text-sm text-slate-600">{config.randomizeOrder ? 'Aktif' : 'Nonaktif'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: QUESTIONS LIST */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Daftar Pertanyaan</h2>
            <p className="text-slate-500 mt-1">Kelola isi teks dan kategori pertanyaan.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
            <Plus className="w-5 h-5" /> Tambah Pertanyaan
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border p-12 text-center text-slate-500 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            Memuat data...
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {config?.selectionMode === 'manual' && <th className="px-6 py-4 w-12 text-center">Pilih</th>}
                  <th className="px-6 py-4 font-semibold text-slate-600">Pertanyaan</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Kategori</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => (
                  <tr key={q.id} className={`hover:bg-slate-50 transition-colors ${
                    config?.selectionMode === 'manual' && config.manualQuestionIds.includes(q.id) ? 'bg-teal-50/30' : ''
                  }`}>
                    {config?.selectionMode === 'manual' && (
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={config.manualQuestionIds.includes(q.id)}
                          onChange={() => toggleManualQuestion(q.id)}
                          className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {editingId === q.id ? (
                        <textarea value={editText} onChange={e => setEditText(e.target.value)}
                          className="w-full p-3 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none" rows={2} />
                      ) : q.text}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === q.id ? (
                        <input value={editCategory} onChange={e => setEditCategory(e.target.value)}
                          className="w-32 p-2 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 outline-none" />
                      ) : (
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{q.category}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {editingId === q.id ? (
                          <>
                            <button onClick={handleEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Simpan"><Check className="w-5 h-5" /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg" title="Batal"><X className="w-5 h-5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(q)} className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus"><Trash2 className="w-4 h-4" /></button>
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-3xl max-w-lg w-full shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold mb-2">Tambah Pertanyaan</h2>
            <p className="text-slate-500 mb-8 text-sm">Tambahkan pertanyaan baru ke dalam bank soal.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Teks Pertanyaan</label>
                <textarea className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none h-32 transition-all"
                  placeholder="Ketik pertanyaan di sini..." value={newText} onChange={e => setNewText(e.target.value)} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Kategori</label>
                <input className="w-full p-4 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Contoh: Depresi, Kecemasan, Stress" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
                <button onClick={handleAdd} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg">Simpan Pertanyaan</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
