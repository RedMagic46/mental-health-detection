'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Info, Calendar, Brain, Activity, ShieldAlert, FileText } from 'lucide-react';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();
  const score = parseInt(searchParams.get('score') || '0');
  const maxScore = parseInt(searchParams.get('maxScore') || '126');
  const percentage = parseInt(searchParams.get('percentage') || '0');
  const label = searchParams.get('label') || 'normal';
  const recommendation = searchParams.get('recommendation') || '';


  const depScore = parseInt(searchParams.get('depScore') || '0');
  const depLevel = searchParams.get('depLevel') || 'Normal';
  const anxScore = parseInt(searchParams.get('anxScore') || '0');
  const anxLevel = searchParams.get('anxLevel') || 'Normal';
  const strScore = parseInt(searchParams.get('strScore') || '0');
  const strLevel = searchParams.get('strLevel') || 'Normal';

  const configs: Record<string, { title: string; subtitle: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
    normal: {
      title: 'Kondisi Mental Normal / Stabil',
      subtitle: 'Hasil analisis Machine Learning mendeteksi respon Anda berada pada tingkat risiko rendah.',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50/50',
      borderColor: 'border-emerald-100',
      icon: <CheckCircle className="w-14 h-14 text-emerald-600" />,
    },
    at_risk: {
      title: 'Gejala Sedang (At Risk)',
      subtitle: 'Hasil analisis Machine Learning mendeteksi kecenderungan sedang pada kecemasan, depresi, atau stres.',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50/50',
      borderColor: 'border-amber-100',
      icon: <Info className="w-14 h-14 text-amber-600" />,
    },
    critical: {
      title: 'Indikasi Gejala Berat (Critical)',
      subtitle: 'Hasil analisis Machine Learning mendeteksi tingkat keparahan yang tinggi pada kondisi mental Anda.',
      color: 'text-rose-700',
      bgColor: 'bg-rose-50/50',
      borderColor: 'border-rose-100',
      icon: <AlertTriangle className="w-14 h-14 text-rose-600" />,
    },
  };

  const config = configs[label] || configs.normal;

  const getSubscaleStyle = (level: string) => {
    const norm = level.toLowerCase();
    if (norm === 'normal') {
      return {
        badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
        progressBarBg: 'bg-emerald-500',
        textColor: 'text-emerald-800',
        cardBg: 'from-emerald-50/30 to-emerald-50/10 border-emerald-100/50',
        desc: 'Gejala minimal atau tidak ada.',
      };
    }
    if (norm === 'ringan') {
      return {
        badgeBg: 'bg-sky-100 text-sky-800 border-sky-200/50',
        progressBarBg: 'bg-sky-500',
        textColor: 'text-sky-800',
        cardBg: 'from-sky-50/30 to-sky-50/10 border-sky-100/50',
        desc: 'Gejala awal ringan terdeteksi.',
      };
    }
    if (norm === 'sedang') {
      return {
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200/50',
        progressBarBg: 'bg-amber-500',
        textColor: 'text-amber-800',
        cardBg: 'from-amber-50/30 to-amber-50/10 border-amber-100/50',
        desc: 'Tingkat sedang, perlu diperhatikan.',
      };
    }
    if (norm === 'parah') {
      return {
        badgeBg: 'bg-orange-100 text-orange-800 border-orange-200/50',
        progressBarBg: 'bg-orange-500',
        textColor: 'text-orange-800',
        cardBg: 'from-orange-50/30 to-orange-50/10 border-orange-100/50',
        desc: 'Gejala parah, disarankan konseling.',
      };
    }
    return {
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200/50',
      progressBarBg: 'bg-rose-500',
      textColor: 'text-rose-800',
      cardBg: 'from-rose-50/30 to-rose-50/10 border-rose-100/50',
      desc: 'Gejala sangat parah, butuh bantuan profesional.',
    };
  };

  const subscales = [
    {
      name: 'Depresi',
      score: depScore,
      max: 42,
      level: depLevel,
      icon: <Brain className="w-5 h-5 text-indigo-500" />,
      style: getSubscaleStyle(depLevel),
    },
    {
      name: 'Kecemasan (Anxiety)',
      score: anxScore,
      max: 42,
      level: anxLevel,
      icon: <Activity className="w-5 h-5 text-teal-500" />,
      style: getSubscaleStyle(anxLevel),
    },
    {
      name: 'Stres',
      score: strScore,
      max: 42,
      level: strLevel,
      icon: <ShieldAlert className="w-5 h-5 text-orange-500" />,
      style: getSubscaleStyle(strLevel),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow space-y-10">

      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl">
          Hasil Analisis Kesehatan Mental
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Penilaian didukung oleh analisis model Machine Learning berbasis instrumen klinis DASS-21.
        </p>
      </div>


      <div className={`p-8 md:p-10 rounded-3xl border shadow-sm bg-gradient-to-br ${config.bgColor} ${config.borderColor} flex flex-col items-center text-center transition-all duration-300`}>
        <div className="flex justify-center mb-6 p-3 bg-white rounded-full shadow-sm">{config.icon}</div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-white px-3 py-1 rounded-full shadow-inner border border-slate-100 mb-3">Tingkat Risiko Utama</span>
        <h2 className={`text-3xl font-bold mb-3 ${config.color}`}>{config.title}</h2>
        <p className="text-sm text-slate-500 mb-6 font-medium max-w-md">{config.subtitle}</p>

        <div className="w-full max-w-2xl border-t border-slate-200/50 pt-6">
          <p className="text-base font-semibold text-slate-800 mb-2 flex items-center justify-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Rekomendasi Klinis:
          </p>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
            {recommendation}
          </p>
        </div>

        <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 inline-flex items-center gap-4">
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Total Skor DASS-21</span>
            <span className="text-lg font-extrabold text-slate-800">{score} <span className="text-xs font-medium text-slate-400">/ {maxScore} Poin</span></span>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Persentase</span>
            <span className="text-lg font-extrabold text-slate-800">{percentage}%</span>
          </div>
        </div>
      </div>


      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Rincian Sub-Skala
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscales.map((sub, idx) => {
            const subPercentage = Math.round((sub.score / sub.max) * 100);
            return (
              <div key={idx} className={`bg-gradient-to-b ${sub.style.cardBg} border rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300`}>
                <div className="space-y-4">

                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm">{sub.icon}</span>
                      <span className="font-bold text-slate-800 text-base">{sub.name}</span>
                    </div>
                  </div>


                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mb-1">Status Keparahan</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${sub.style.badgeBg}`}>
                      {sub.level}
                    </span>
                  </div>


                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Skor: <strong>{sub.score}</strong> / {sub.max}</span>
                      <span>{subPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`${sub.style.progressBarBg} h-2 rounded-full transition-all duration-500`} style={{ width: `${subPercentage}%` }}></div>
                    </div>
                  </div>
                </div>


                <div className="mt-5 pt-3 border-t border-slate-200/50 text-[11px] text-slate-500">
                  {sub.style.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl">
        <h4 className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-primary" /> Disclaimer Penting:
        </h4>
        <p className="text-slate-500 text-xs leading-relaxed">
          Platform deteksi dini kesehatan mental ini bukanlah alat diagnosis klinis yang definitif. Model kecerdasan buatan (Machine Learning) ini dirancang hanya untuk keperluan skrining awal untuk mengidentifikasi tingkat kecenderungan psikologis Anda berdasarkan instrumen DASS-21. Kami sangat menyarankan agar Anda berkonsultasi secara langsung dengan psikolog atau psikiater klinis profesional untuk mendapatkan pemeriksaan medis yang formal.
        </p>
      </div>


      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Link href="/dashboard" className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
          Kembali ke Dashboard
        </Link>
        <Link href="/consultations" className="px-8 py-4 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm">
          <Calendar className="w-4 h-4" /> Konsultasikan Hasil dengan Psikolog
        </Link>
      </div>
    </div>
  );
}

export default function AssessmentResultPage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center"><div className="animate-pulse text-muted-foreground text-sm font-medium">Memuat hasil analisis...</div></div>}>
      <ResultContent />
    </Suspense>
  );
}
