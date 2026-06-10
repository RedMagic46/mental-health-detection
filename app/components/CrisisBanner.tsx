'use client';

import Link from 'next/link';
import { Phone, AlertTriangle, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/useStore';
import { useEffect, useState } from 'react';

export default function CrisisBanner() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      fetch('/api/assessment/history')
        .then((res) => {
          if (res.ok) return res.json();
          return { assessments: [] };
        })
        .then((data) => {
          const assessments = data.assessments || [];
          if (assessments.length > 0 && assessments[0].label === 'critical') {
            setIsCritical(true);
          } else {
            setIsCritical(false);
          }
        })
        .catch(() => {});
    } else {
      setIsCritical(false);
    }
  }, [isAuthenticated, user, pathname]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/consultant')) {
    return null;
  }

  if (isCritical) {
    return (
      <div className="bg-red-600 text-white px-4 py-3 text-sm font-semibold flex flex-col md:flex-row items-center justify-center gap-3 animate-pulse">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-350" />
          <span>
            PENTING: Hasil tes Anda menunjukkan tingkat risiko tinggi. Segera hubungi Hotline Kesehatan Jiwa (119 ext 8) atau Halo Kemenkes (1500-567)!
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline border-l border-white/30 h-4" />
          <Link
            href="/consultations"
            className="bg-white text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1 shrink-0"
          >
            Mulai Konsultasi Darurat <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-600/90 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2">
      <Phone className="w-4 h-4" />
      <span>
        Butuh bantuan segera? Hubungi Layanan Darurat atau Hotline Kesehatan Jiwa (119 ext 8).
      </span>
    </div>
  );
}
