'use client';

import { useAuthStore } from '../../store/useStore';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CalendarCheck, 
  FileQuestion, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  MoreVertical, 
  CheckCircle,
  Calendar
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  userGrowthPercentage: number;
  totalAssessments: number;
  totalConsultations: number;
  totalQuestions: number;
  consultationsByStatus: { new: number; in_progress: number; done: number };
  userGrowth: { month: string; count: number }[];
  caseDistribution: { label: string; percentage: string; rawPercentage: number; count: number }[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastActiveAt?: string | null;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().slice(0, 10);
  });

  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const fiveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 4, 1);
    const tzOffset = fiveMonthsAgo.getTimezoneOffset() * 60000;
    return (new Date(fiveMonthsAgo.getTime() - tzOffset)).toISOString().slice(0, 10);
  });

  const fetchStats = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?startDate=${start}&endDate=${end}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch {  } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setRecentUsers((data.users || []).slice(0, 4));
      }
    } catch {  } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchStats(startDate, endDate);
    }
  }, [isAuthenticated, user, startDate, endDate, fetchStats]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchRecentUsers();
    }
  }, [isAuthenticated, user, fetchRecentUsers]);

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  const [mountedTime] = useState(() => Date.now());

  const getStatusText = (lastActiveAt?: string | null, createdAt?: string) => {
    const activeTimeStr = lastActiveAt || createdAt;
    if (!activeTimeStr) return { text: 'Offline', isOnline: false };
    const lastActive = new Date(activeTimeStr).getTime();
    const diffMs = mountedTime - lastActive;
    
    if (lastActiveAt && diffMs < 3 * 60 * 1000) {
      return { text: 'Online', isOnline: true };
    }
    
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) {
      return { text: `Offline, ${diffMins}m lalu`, isOnline: false };
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return { text: `Offline, ${diffHours}j lalu`, isOnline: false };
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) {
      return { text: `Offline, ${diffDays}h lalu`, isOnline: false };
    }
    
    const dateStr = new Date(activeTimeStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
    return { text: `Offline, ${dateStr}`, isOnline: false };
  };

  
  const getGrowthChartPaths = () => {
    const trend = stats?.userGrowth || [];
    if (trend.length === 0) return { linePath: '', fillPath: '', points: [] };

    const maxVal = Math.max(...trend.map(t => t.count), 1);
    const points = trend.map((t, idx) => {
      const x = idx * 25; 
      const y = 90 - (t.count / maxVal) * 70; 
      return { x, y, count: t.count, month: t.month };
    });

    
    let linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + 12.5;
      const cpY1 = p0.y;
      const cpX2 = p1.x - 12.5;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const fillPath = `${linePath} L 100 100 L 0 100 Z`;

    return { linePath, fillPath, points };
  };

  
  const getDonutChartStyle = () => {
    const dist = stats?.caseDistribution || [];
    if (dist.length === 0) return 'conic-gradient(#076148 0% 100%)';

    let currentPercentage = 0;
    const colors = ['#076148', '#d97706', '#b91c1c'];
    
    const gradientParts = dist.map((item, idx) => {
      const start = currentPercentage;
      const end = start + (item.rawPercentage || 0);
      currentPercentage = end;
      const color = colors[idx] || '#cbd5e1';
      return `${color} ${start}% ${end}%`;
    });

    return `conic-gradient(${gradientParts.join(', ')})`;
  };

  const { linePath, fillPath, points } = getGrowthChartPaths();

  return (
    <div className="p-6 max-w-[1440px] w-full mx-auto space-y-8 flex-grow">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface mb-1">Dashboard Ringkasan</h2>
          <p className="text-sm text-on-surface-variant">Ikhtisar metrik platform dan aktivitas terkini.</p>
        </div>
        
        
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex items-center bg-surface-container-lowest border border-border/40 rounded-xl px-3 py-1.5 shadow-sm hover:border-primary transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          >
            <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Dari</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-on-surface cursor-pointer focus:ring-0 p-0"
            />
          </div>
          <div
            className="flex items-center bg-surface-container-lowest border border-border/40 rounded-xl px-3 py-1.5 shadow-sm hover:border-primary transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
            style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
          >
            <span className="text-[10px] font-bold text-slate-400 mr-2 uppercase">Sampai</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-bold text-on-surface cursor-pointer focus:ring-0 p-0"
            />
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div
          className="bg-surface-container-lowest rounded-2xl p-5 border border-border/15 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-fixed/20 flex items-center justify-center text-primary">
              <Users className="w-5 h-5" />
            </div>
            {loading ? (
              <div className="h-5 w-10 bg-slate-100 animate-pulse rounded-full"></div>
            ) : (
              <span className="flex items-center text-primary text-xs font-bold bg-primary-fixed/20 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{stats?.userGrowthPercentage || 0}%
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Total Pengguna</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-on-surface">{stats?.totalUsers}</h3>
            )}
          </div>
        </div>

        
        <div
          className="bg-surface-container-lowest rounded-2xl p-5 border border-border/15 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-secondary">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Tes Dilakukan</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-on-surface">{stats?.totalAssessments}</h3>
            )}
          </div>
        </div>

        
        <div
          className="bg-surface-container-lowest rounded-2xl p-5 border border-border/15 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            {!loading && stats && stats.consultationsByStatus.new > 0 && (
              <span className="flex items-center text-indigo-700 text-xs font-bold bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Baru
              </span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Konsultasi</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-on-surface">{stats?.totalConsultations}</h3>
            )}
          </div>
        </div>

        
        <div
          className="bg-surface-container-lowest rounded-2xl p-5 border border-error/30 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm relative overflow-hidden"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="absolute top-0 right-0 w-12 h-12 bg-destructive/5 rounded-bl-full"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-destructive">
              <FileQuestion className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Pertanyaan Kuesioner</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-md mt-1"></div>
            ) : (
              <h3 className="text-3xl font-extrabold text-on-surface">{stats?.totalQuestions}</h3>
            )}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div 
          className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 border border-border/15 flex flex-col h-[380px] shadow-sm"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Pertumbuhan Pengguna</h3>
              <p className="text-xs text-on-surface-variant">Data trend pertumbuhan pengguna kumulatif.</p>
            </div>
            <button className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          
          
          <div className="flex-grow relative w-full h-full flex items-end">
            
            <div className="absolute inset-0 flex flex-col justify-between pb-6">
              <div className="w-full h-[1px] bg-slate-100"></div>
              <div className="w-full h-[1px] bg-slate-100"></div>
              <div className="w-full h-[1px] bg-slate-100"></div>
              <div className="w-full h-[1px] bg-slate-100"></div>
              <div className="w-full h-[1px] bg-slate-200"></div>
            </div>
            
            {points.length > 0 && (
              <svg className="absolute inset-0 h-[calc(100%-1.5rem)] w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#076148" stopOpacity="0.25"></stop>
                    <stop offset="100%" stopColor="#076148" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                
                <path d={fillPath} fill="url(#chart-gradient)"></path>
                
                <path 
                  d={linePath} 
                  fill="none" 
                  stroke="#076148" 
                  strokeLinecap="round" 
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                ></path>

              </svg>
            )}
            
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] font-bold text-on-surface-variant/70 px-1">
              {points.map((p, idx) => (
                <span key={idx}>{p.month}</span>
              ))}
            </div>
          </div>
        </div>

        
        <div 
          className="lg:col-span-1 bg-surface-container-lowest rounded-2xl p-6 border border-border/15 shadow-sm flex flex-col justify-between"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div>
            <h3 className="text-lg font-bold text-on-surface mb-6">Distribusi Kasus</h3>
            
            <div className="flex items-center justify-center relative mb-6">
              
              <div 
                className="w-36 h-36 rounded-full transition-all duration-500"
                style={{ background: getDonutChartStyle() }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-surface-container-lowest rounded-full"></div>
              </div>
            </div>
          </div>

          
          <div className="space-y-2.5 text-xs">
            {stats?.caseDistribution ? (
              stats.caseDistribution.map((item, idx) => {
                const colorClasses = ['bg-[#076148]', 'bg-[#d97706]', 'bg-[#b91c1c]'];
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorClasses[idx] || 'bg-slate-300'}`} />
                      <span className="font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.percentage}</span>
                  </div>
                );
              })
            ) : (
              ['Normal', 'Beresiko', 'Kritis'].map((label, idx) => {
                const colorClasses = ['bg-[#076148]', 'bg-[#d97706]', 'bg-[#b91c1c]'];
                return (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${colorClasses[idx]}`} />
                      <span className="font-semibold text-slate-700">{label}</span>
                    </div>
                    <span className="font-bold text-slate-800">...</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div 
          className="lg:col-span-2 bg-surface-container-lowest rounded-2xl border border-border/15 shadow-sm overflow-hidden flex flex-col"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-on-surface">Pendaftar Terbaru</h3>
              <p className="text-xs text-on-surface-variant mt-0.5">Daftar pengguna yang baru saja bergabung.</p>
            </div>
            <Link href="/admin/users" className="text-xs font-bold text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="overflow-x-auto w-full">
            {loadingUsers ? (
              <div className="divide-y divide-slate-100 w-full">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="px-5 py-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                      <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                        <div className="h-2 w-28 bg-slate-100 rounded-md"></div>
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-slate-100 rounded-md"></div>
                    <div className="h-4 w-14 bg-slate-100 rounded-md"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded-md"></div>
                  </div>
                ))}
              </div>
            ) : recentUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">Belum ada pengguna terdaftar.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                    <th className="px-5 py-3.5">Pengguna</th>
                    <th className="px-5 py-3.5">Peranan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Tanggal Gabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                  {recentUsers.map((u, index) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] shadow-sm">
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-800 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {u.role === 'admin' ? (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                            Admin
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 border border-slate-200/50 px-2 py-0.5 rounded-md text-[10px] font-semibold">
                            Pasien
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {(() => {
                          const status = getStatusText(u.lastActiveAt, u.createdAt);
                          return (
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                              <span className={status.isOnline ? 'font-semibold text-primary' : 'text-slate-500'}>
                                {status.text}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-5 py-3 text-right text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        
        <div 
          className="lg:col-span-1 bg-surface-container-lowest rounded-2xl p-5 border border-border/15 shadow-sm flex flex-col justify-between"
          style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)' }}
        >
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-on-surface">Status Konsultasi</h3>
              {stats && stats.consultationsByStatus.new > 0 && (
                <span className="bg-red-50 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
                  {stats.consultationsByStatus.new} Baru
                </span>
              )}
            </div>

            <div className="space-y-4">
              
              <Link 
                href="/admin/consultations" 
                className="flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-destructive shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs group-hover:text-primary transition-colors">Permintaan Baru</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {loading 
                      ? 'Memuat data...' 
                      : `Ada ${stats?.consultationsByStatus.new || 0} konsultasi baru menunggu ditangani.`
                    }
                  </p>
                </div>
              </Link>

              
              <Link 
                href="/admin/consultations" 
                className="flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="w-9 h-9 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs group-hover:text-primary transition-colors">Sesi Sedang Berjalan</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {loading 
                      ? 'Memuat data...' 
                      : `Ada ${stats?.consultationsByStatus.in_progress || 0} sesi konsultasi aktif sedang berlangsung.`
                    }
                  </p>
                </div>
              </Link>

              
              <Link 
                href="/admin/consultations" 
                className="flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <CheckCircle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-xs group-hover:text-primary transition-colors">Selesai Ditangani</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {loading 
                      ? 'Memuat data...' 
                      : `Sebanyak ${stats?.consultationsByStatus.done || 0} sesi konsultasi telah berhasil diselesaikan.`
                    }
                  </p>
                </div>
              </Link>
            </div>
          </div>

          <Link
            href="/admin/consultations"
            className="w-full mt-5 py-2 text-center border border-border/50 text-slate-600 hover:text-slate-800 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors block"
          >
            Kelola Semua Konsultasi
          </Link>
        </div>
      </div>
    </div>
  );
}
