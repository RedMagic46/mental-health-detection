'use client';

import { useAuthStore } from '../../store/useStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConsultationsPanel from '../../components/ConsultationsPanel';

export default function AdminConsultationsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manajemen Konsultasi</h1>
        <p className="text-slate-500 mt-1 text-sm">Pantau, tugaskan konsultan, dan jawab obrolan konsultasi klien.</p>
      </div>

      <ConsultationsPanel 
        isAdmin={true} 
        currentUser={{
          id: user.id,
          name: user.name,
          role: user.role as 'admin' | 'consultant'
        }} 
      />
    </div>
  );
}
