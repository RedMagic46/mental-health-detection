'use client';

import { useAuthStore } from '../../store/useStore';
import ConsultationsPanel from '../../components/ConsultationsPanel';

export default function ConsultantConsultationsPage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Konsultasi Saya</h1>
        <p className="text-slate-500 mt-1 text-sm">Tangani chat konsultasi dan kelola status tiket yang di-assign kepada Anda.</p>
      </div>

      <ConsultationsPanel 
        isAdmin={false} 
        currentUser={{
          id: user.id,
          name: user.name,
          role: user.role as 'admin' | 'consultant'
        }} 
      />
    </div>
  );
}
