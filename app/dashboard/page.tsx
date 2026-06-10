'use client';

import { useAuthStore } from '../store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Calendar, Activity, ArrowRight, Smile, Meh, Frown } from 'lucide-react';
import MoodChart from "../components/MoodChart";

const MENTAL_HEALTH_TIPS = [
  "Tarik napas dalam-dalam, tahan selama 4 detik, dan hembuskan perlahan.",
  "Sempatkan berjalan kaki selama 10 menit di luar ruangan untuk menjernihkan pikiran.",
  "Tuliskan tiga hal yang Anda syukuri hari ini, sekecil apa pun itu.",
  "Batasi waktu layar (screen time) Anda sebelum tidur untuk istirahat yang lebih berkualitas.",
  "Ingatlah bahwa tidak apa-apa untuk merasa tidak baik-baik saja. Berikan diri Anda ruang untuk berproses.",
  "Cobalah minum segelas air putih hangat dan lakukan peregangan otot ringan saat merasa jenuh.",
  "Fokuslah pada apa yang bisa Anda kendalikan saat ini, dan biarkan sisanya mengalir apa adanya.",
  "Bicarakan apa yang mengganjal di pikiran Anda dengan seseorang yang Anda percayai.",
  "Kurangi asupan kafein berlebih hari ini jika Anda merasa cemas atau gelisah.",
  "Mendengarkan musik favorit Anda selama 15 menit dapat meningkatkan mood secara instan.",
  "Bersikaplah lembut pada diri sendiri hari ini. Anda sudah melakukan yang terbaik.",
  "Batasi konsumsi berita negatif atau media sosial jika Anda merasa mulai cemas.",
  "Lakukan hobi atau aktivitas kreatif singkat hari ini untuk menyegarkan pikiran Anda.",
  "Rapikan meja kerja atau kamar Anda. Lingkungan yang rapi membantu menenangkan pikiran.",
  "Ucapkan kata-kata afirmasi positif pada diri sendiri di depan cermin sebelum memulai hari.",
  "Sempatkan menghubungi teman dekat atau keluarga untuk sekadar menanyakan kabar.",
  "Nikmati makanan Anda dengan perlahan tanpa gangguan gawai (mindful eating).",
  "Jangan ragu untuk menolak permintaan orang lain jika energi mental Anda sedang terbatas.",
  "Biarkan diri Anda tertawa hari ini dengan menonton video lucu atau membaca komik ringan.",
  "Cobalah teknik grounding 5-4-3-2-1 saat merasa cemas untuk kembali fokus pada saat ini.",
  "Tidur siang singkat selama 15-20 menit dapat mengembalikan fokus dan energi Anda.",
  "Ingatlah bahwa proses pemulihan tidak selalu berjalan mulus, dan itu sangat wajar."
];

interface AssessmentHistory {
  id: string;
  score: number;
  label: string;
  createdAt: string;
}

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodData, setMoodData] = useState<{ day: string; mood: number }[]>([]);
  const [history, setHistory] = useState<AssessmentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [dailyTip, setDailyTip] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MENTAL_HEALTH_TIPS.length);
    setDailyTip(MENTAL_HEALTH_TIPS[randomIndex]);
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/assessment/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.assessments);
      }
    } catch {  } finally {
      setLoadingHistory(false);
    }
  }, []);

  const fetchMoodData = useCallback(async () => {
    try {
      const res = await fetch('/api/mood');
      if (res.ok) {
        const data = await res.json();
        setMoodData(data.chartData || []);
        if (data.todayMood) {
          setSelectedMood(data.todayMood.mood);
        }
      }
    } catch {  }
  }, []);

  const handleMoodSelect = async (mood: string) => {
    setSelectedMood(mood);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.chartData) {
          setMoodData(data.chartData);
        }
      }
    } catch {  }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'consultant') {
        router.push('/consultant/consultations');
      }
    }
  }, [isAuthenticated, user, router, isLoading]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'user') {
      fetchHistory();
      fetchMoodData();
    }
  }, [isAuthenticated, user, fetchHistory, fetchMoodData]);

  if (isLoading || !isAuthenticated || user?.role !== 'user') return null;

  const labelMap: Record<string, { text: string; cls: string }> = {
    normal: { text: 'Normal', cls: 'bg-green-100 text-green-700' },
    at_risk: { text: 'Berisiko', cls: 'bg-yellow-100 text-yellow-700' },
    critical: { text: 'Kritis', cls: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Halo, {user?.name}!</h1>
        <p className="text-muted-foreground mt-2">Selamat datang di dashboard personal MindCare Anda.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Cek Kondisi Anda Hari Ini</h2>
              <p className="text-primary-foreground/80 mb-4 max-w-md">Ikuti kuesioner singkat kami untuk mendeteksi potensi masalah kesehatan mental lebih dini.</p>
              <Link href="/assessment" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-teal-50 transition-colors">
                Mulai Kuesioner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white/20 p-4 rounded-full"><Activity className="w-16 h-16 text-white" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg"><FileText className="w-6 h-6 text-blue-600" /></div>
                <h3 className="font-semibold text-lg">Riwayat Tes</h3>
              </div>
              {loadingHistory ? (
                <div className="h-6 bg-muted/50 rounded animate-pulse" />
              ) : history.length === 0 ? (
                <>
                  <p className="text-muted-foreground text-sm mb-4">Belum ada tes.</p>
                  <Link href="/assessment" className="text-primary text-sm font-medium hover:underline">Mulai tes pertama</Link>
                </>
              ) : (
                <div className="space-y-2">
                  {history.slice(0, 3).map((h) => (
                    <div key={h.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleDateString('id-ID')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${labelMap[h.label]?.cls || ''}`}>{labelMap[h.label]?.text || h.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 p-3 rounded-lg"><Calendar className="w-6 h-6 text-purple-600" /></div>
                <h3 className="font-semibold text-lg">Sesi Konsultasi</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">Butuh bantuan profesional?</p>
              <Link href="/consultations" className="text-primary text-sm font-medium hover:underline">Buat konsultasi baru</Link>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Mood Tracker Harian</h3>
            <p className="text-sm text-muted-foreground mb-4">Bagaimana perasaan Anda hari ini?</p>
            <div className="flex justify-between">
              {[{ key: 'good', Icon: Smile, label: 'Baik', active: 'bg-green-100 text-green-700' },
              { key: 'neutral', Icon: Meh, label: 'Biasa', active: 'bg-yellow-100 text-yellow-700' },
              { key: 'bad', Icon: Frown, label: 'Buruk', active: 'bg-red-100 text-red-700' }]
                .map(({ key, Icon, label, active }) => (
                  <button
                    key={key}
                    onClick={() => handleMoodSelect(key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${selectedMood === key
                      ? active
                      : "hover:bg-slate-50 text-slate-500"
                      }`}
                  >
                    <Icon className="w-8 h-8" />
                    <span className="text-xs font-medium">
                      {label}
                    </span>
                  </button>
                ))
              }
            </div>
          </div>
          <MoodChart data={moodData} />
          <div className="bg-slate-50 p-6 rounded-2xl border border-border">
            <h3 className="font-semibold text-lg mb-2">Tips Hari Ini</h3>
            <p className="text-sm text-muted-foreground italic">&quot;{dailyTip || "Tarik napas dalam-dalam, tahan selama 4 detik, dan hembuskan perlahan."}&quot;</p>
          </div>
        </div>
      </div>
    </div>
  );
}
