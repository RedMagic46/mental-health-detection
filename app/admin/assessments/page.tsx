'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Trash2, Search, Filter, X, Eye, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Assessment {
  id: string;
  userId: string;
  answers: Record<number, number>;
  score: number;
  label: 'normal' | 'at_risk' | 'critical';
  recommendation: string;
  createdAt: string;
  user?: UserInfo;
}

interface Question {
  id: number;
  text: string;
  category: string;
  weight: number;
}

export default function AdminAssessmentsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<'all' | 'normal' | 'at_risk' | 'critical'>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [aRes, qRes] = await Promise.all([
        fetch('/api/admin/assessments'),
        fetch('/api/questions')
      ]);

      if (aRes.ok && qRes.ok) {
        const aData = await aRes.json();
        const qData = await qRes.json();
        setAssessments(aData.assessments || []);
        setQuestions(qData.questions || []);
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data riwayat kuesioner.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat tes ini secara permanen?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/assessments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAssessments(prev => prev.filter(a => a.id !== id));
        if (selectedAssessment?.id === id) {
          setSelectedAssessment(null);
        }
        setMessage({ type: 'success', text: 'Riwayat tes berhasil dihapus.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus riwayat tes.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const nameMatch = a.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const emailMatch = a.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSearch = searchQuery === '' || nameMatch || emailMatch;
    const matchesLabel = labelFilter === 'all' || a.label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  const getLabelBadge = (label: string) => {
    switch (label) {
      case 'normal':
        return (
          <span className="bg-[#076148]/10 text-[#076148] border border-[#076148]/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
            Normal
          </span>
        );
      case 'at_risk':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            Beresiko
          </span>
        );
      case 'critical':
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse">
            Kritis
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            {label}
          </span>
        );
    }
  };

  const scoreMap: Record<number, string> = {
    0: 'Tidak pernah',
    1: 'Kadang-kadang',
    2: 'Sering',
    3: 'Sangat sering'
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-10">
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
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

      
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
          <ClipboardList className="w-6 h-6 text-primary" /> Riwayat Skrining Tes
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Lihat hasil skrining kuesioner pasien, skor DASS-21, dan anjuran psikologis.</p>
      </div>

      
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Cari pasien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        
        <div className="flex items-center gap-3 w-full md:w-auto self-start md:self-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <Filter className="w-3.5 h-3.5 text-primary" /> Label Status:
          </span>
          <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'normal', label: 'Normal' },
              { key: 'at_risk', label: 'Beresiko' },
              { key: 'critical', label: 'Kritis' }
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setLabelFilter(item.key as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex-1 md:flex-none ${
                  labelFilter === item.key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      
      {loading ? (
        
        <div className="space-y-4 w-full p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div className="h-4 w-1/4 bg-slate-100 animate-pulse rounded-md"></div>
            <div className="h-4 w-12 bg-slate-100 animate-pulse rounded-md"></div>
          </div>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-b-0">
              <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 bg-slate-100 animate-pulse rounded-md"></div>
                <div className="h-2.5 w-1/4 bg-slate-100 animate-pulse rounded-md"></div>
              </div>
              <div className="h-4 w-1/12 bg-slate-100 animate-pulse rounded-md"></div>
              <div className="h-6 w-20 bg-slate-100 animate-pulse rounded-full"></div>
              <div className="h-8 w-8 bg-slate-100 animate-pulse rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 shadow-sm">
          Tidak ada data riwayat skrining yang cocok.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Pasien</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Tanggal Tes</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Skor</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredAssessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    {a.user ? (
                      <div>
                        <span className="font-semibold text-slate-800 block">{a.user.name}</span>
                        <span className="text-[10px] text-slate-400 block">{a.user.email}</span>
                      </div>
                    ) : (
                      <div>
                        <span className="font-semibold text-slate-400 italic block">Tidak Diketahui</span>
                        <span className="text-[10px] text-slate-300 block">ID: {a.userId || '-'}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(a.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">{a.score} Poin</td>
                  <td className="px-6 py-4">{getLabelBadge(a.label)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedAssessment(a)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-teal-50 rounded-lg transition-all"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Hapus Riwayat"
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

      
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-white/20 flex flex-col max-h-[85vh] overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Detail Riwayat Skrining</h2>
                <p className="text-slate-400 text-xs mt-0.5">Hasil tes kuesioner kesehatan mental pasien.</p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="text-slate-400 hover:text-slate-700 rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            
            <div className="p-6 overflow-y-auto space-y-6 flex-grow">
              
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pasien</span>
                  <span className="font-semibold text-slate-800 text-sm block">{selectedAssessment.user?.name || 'Anonim'}</span>
                  <span className="text-xs text-slate-500 block">{selectedAssessment.user?.email || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Pengambilan</span>
                  <span className="text-xs text-slate-700 block">
                    {new Date(selectedAssessment.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status & Skor</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {getLabelBadge(selectedAssessment.label)}
                    <span className="font-extrabold text-slate-800 text-sm">{selectedAssessment.score} Poin</span>
                  </div>
                </div>
              </div>

              
              {(selectedAssessment.answers as any).ml_result && (
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hasil Analisis Machine Learning (DASS-21)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {['depression', 'anxiety', 'stress'].map((key) => {
                      const data = (selectedAssessment.answers as any).ml_result[key];
                      if (!data) return null;
                      const title = key === 'depression' ? 'Depresi' : key === 'anxiety' ? 'Kecemasan' : 'Stres';
                      const maxVal = 42;
                      const pct = Math.min(100, Math.round((data.score / maxVal) * 100));
                      
                      let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                      let barBg = 'bg-emerald-500';
                      const lvl = data.level.toLowerCase();
                      if (lvl === 'ringan') {
                        badgeBg = 'bg-sky-50 text-sky-700 border-sky-100';
                        barBg = 'bg-sky-500';
                      } else if (lvl === 'sedang') {
                        badgeBg = 'bg-amber-50 text-amber-700 border-amber-100';
                        barBg = 'bg-amber-500';
                      } else if (lvl === 'parah') {
                        badgeBg = 'bg-orange-50 text-orange-700 border-orange-100';
                        barBg = 'bg-orange-500';
                      } else if (lvl.includes('sangat') || lvl.includes('parah') || lvl.includes('extreme')) {
                        badgeBg = 'bg-rose-50 text-rose-700 border-rose-100';
                        barBg = 'bg-rose-500';
                      }

                      return (
                        <div key={key} className="p-4 rounded-xl border border-slate-200/60 bg-slate-50/50 flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-xs text-slate-700 block">{title}</span>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1.5 ${badgeBg}`}>
                              {data.level}
                            </span>
                          </div>
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                              <span>Skor: {data.score} / {maxVal}</span>
                              <span>{pct}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div className={`${barBg} h-full`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anjuran & Rekomendasi</span>
                <div className="p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 bg-white leading-relaxed whitespace-pre-line shadow-inner">
                  {selectedAssessment.recommendation}
                </div>
              </div>

              
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rincian Jawaban Soal</span>
                <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-2xl overflow-hidden bg-white">
                  {questions.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Memuat rincian soal...</div>
                  ) : (
                    questions.map((q, idx) => {
                      const userScore = selectedAssessment.answers[q.id];
                      return (
                        <div key={q.id} className="p-4 flex gap-4 text-xs hover:bg-slate-50/30 transition-colors">
                          <span className="font-bold text-slate-400 w-5 shrink-0">{idx + 1}.</span>
                          <div className="flex-grow space-y-1">
                            <span className="text-slate-700 leading-normal block">{q.text}</span>
                            <span className="text-[10px] text-primary/75 font-semibold block uppercase tracking-wider">{q.category}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`px-2.5 py-1 rounded-lg font-bold block ${
                              userScore === 3
                                ? 'bg-red-50 text-red-700'
                                : userScore === 2
                                ? 'bg-amber-50 text-amber-700'
                                : userScore === 1
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-slate-50 text-slate-500'
                            }`}>
                              {scoreMap[userScore] || 'Tidak dijawab'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            
            <div className="p-6 border-t border-slate-100 flex justify-between gap-3 shrink-0 bg-slate-50/50">
              <button
                onClick={() => handleDelete(selectedAssessment.id)}
                className="px-4 py-2 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Hapus Catatan
              </button>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
