'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Info, Calendar } from 'lucide-react';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const maxScore = parseInt(searchParams.get('maxScore') || '30');
  const percentage = parseInt(searchParams.get('percentage') || '0');
  const label = searchParams.get('label') || 'normal';
  const recommendation = searchParams.get('recommendation') || '';

  const configs: Record<string, { title: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
    normal: {
      title: 'Minimal atau Tidak Ada Gejala',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: <CheckCircle className="w-12 h-12 text-green-600" />,
    },
    at_risk: {
      title: 'Gejala Sedang — Perlu Perhatian',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: <Info className="w-12 h-12 text-yellow-600" />,
    },
    critical: {
      title: 'Gejala Berat — Segera Konsultasi',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: <AlertTriangle className="w-12 h-12 text-red-600" />,
    },
  };

  const config = configs[label] || configs.normal;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full flex-grow text-center">
      <h1 className="text-3xl font-bold text-foreground mb-8">Hasil Deteksi Anda</h1>
      <div className={`p-10 rounded-3xl border ${config.bgColor} ${config.borderColor} mb-10`}>
        <div className="flex justify-center mb-6">{config.icon}</div>
        <h2 className={`text-3xl font-bold mb-4 ${config.color}`}>{config.title}</h2>
        <p className="text-lg text-foreground/80 leading-relaxed max-w-2xl mx-auto">
          {recommendation || 'Pertahankan gaya hidup sehat Anda.'}
        </p>
        <div className="mt-8 p-4 bg-white/60 rounded-xl inline-block">
          <p className="text-sm text-muted-foreground font-medium">
            Skor Anda: <span className="text-xl font-bold text-foreground ml-2">{score}</span> / {maxScore}
            <span className="ml-4">({percentage}%)</span>
          </p>
        </div>
      </div>
      <div className="bg-slate-50 border border-border p-8 rounded-2xl mb-10">
        <h3 className="font-semibold text-lg mb-2 text-foreground">Catatan Penting:</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Hasil tes ini bukanlah diagnosis klinis. Tes ini hanya bertujuan sebagai alat skrining awal.
          Hanya psikolog atau psikiater profesional yang dapat memberikan diagnosis yang akurat.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link href="/dashboard" className="px-8 py-4 bg-white border border-border text-foreground font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          Kembali ke Dashboard
        </Link>
        <Link href="/consultations" className="px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <Calendar className="w-5 h-5" /> Buat Jadwal Konsultasi
        </Link>
      </div>
    </div>
  );
}

export default function AssessmentResultPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Memuat hasil...</div></div>}>
      <ResultContent />
    </Suspense>
  );
}
