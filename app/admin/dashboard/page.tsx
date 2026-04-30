'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, FileQuestion, CalendarCheck, Activity } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalAssessments: number;
  totalConsultations: number;
  totalQuestions: number;
  consultationsByStatus: { new: number; in_progress: number; done: number };
}

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') fetchStats();
  }, [isAuthenticated, user, fetchStats]);

  if (isLoading || !isAuthenticated || user?.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2">Selamat datang, {user?.name}. Berikut adalah ringkasan sistem.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { icon: <Users className="w-8 h-8" />, label: 'Total User', value: stats?.totalUsers ?? '-', bg: 'bg-blue-100', text: 'text-blue-600' },
          { icon: <Activity className="w-8 h-8" />, label: 'Tes Dilakukan', value: stats?.totalAssessments ?? '-', bg: 'bg-green-100', text: 'text-green-600' },
          { icon: <CalendarCheck className="w-8 h-8" />, label: 'Konsultasi', value: stats?.totalConsultations ?? '-', bg: 'bg-purple-100', text: 'text-purple-600' },
          { icon: <FileQuestion className="w-8 h-8" />, label: 'Pertanyaan', value: stats?.totalQuestions ?? '-', bg: 'bg-orange-100', text: 'text-orange-600' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`${item.bg} p-4 rounded-xl ${item.text}`}>{item.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-800">{loading ? '...' : item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Akses Cepat</h2>
          <div className="space-y-4">
            <Link href="/admin/questions" className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <FileQuestion className="text-blue-500" />
                <span className="font-medium text-slate-700">Manajemen Pertanyaan Kuesioner</span>
              </div>
              <span className="text-slate-400">&rarr;</span>
            </Link>
            <Link href="/admin/consultations" className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <CalendarCheck className="text-blue-500" />
                <span className="font-medium text-slate-700">Manajemen Konsultasi</span>
              </div>
              <span className="text-slate-400">&rarr;</span>
            </Link>
          </div>
        </div>
        {stats && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Status Konsultasi</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-700">Baru</span>
                <span className="font-bold text-blue-800">{stats.consultationsByStatus.new}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-700">Dalam Proses</span>
                <span className="font-bold text-yellow-800">{stats.consultationsByStatus.in_progress}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-700">Selesai</span>
                <span className="font-bold text-green-800">{stats.consultationsByStatus.done}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
