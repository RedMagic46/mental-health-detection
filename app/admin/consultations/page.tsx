'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Consultation {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
}

export default function AdminConsultationsPage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/consultations');
      if (res.ok) {
        const data = await res.json();
        setConsultations(data.consultations);
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

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
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
    } catch { /* silent */ } finally {
      setUpdating(null);
    }
  };

  if (isLoading || !isAuthenticated || user?.role !== 'admin') return null;

  const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    new: { label: 'Baru', cls: 'bg-blue-100 text-blue-700', icon: <MessageSquare className="w-3 h-3" /> },
    in_progress: { label: 'Proses', cls: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
    done: { label: 'Selesai', cls: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Manajemen Konsultasi</h1>
        <p className="text-slate-500 mt-2">Pantau dan kelola permintaan konsultasi dari pengguna.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">Memuat data...</div>
      ) : consultations.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">Belum ada konsultasi.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600">Nama</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Email</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Pesan</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Tanggal</th>
                  <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consultations.map((c) => {
                  const sc = statusConfig[c.status] || statusConfig.new;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-800">{c.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{c.email}</td>
                      <td className="px-6 py-4 text-slate-800 max-w-xs truncate">{c.message}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{new Date(c.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${sc.cls}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={c.status}
                          disabled={updating === c.id}
                          onChange={(e) => updateStatus(c.id, e.target.value)}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="new">Baru</option>
                          <option value="in_progress">Proses</option>
                          <option value="done">Selesai</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
