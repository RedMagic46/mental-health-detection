'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  category: string;
}

const options = [
  { value: 0, label: 'Tidak pernah' },
  { value: 1, label: 'Beberapa hari' },
  { value: 2, label: 'Lebih dari separuh waktu' },
  { value: 3, label: 'Hampir setiap hari' },
];

export default function AssessmentPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingQ, setLoadingQ] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/questions')
      .then(r => r.json())
      .then(d => { setQuestions(d.questions); setLoadingQ(false); })
      .catch(() => { setError('Gagal memuat pertanyaan.'); setLoadingQ(false); });
  }, []);

  if (loadingQ) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-600">{error || 'Tidak ada pertanyaan tersedia.'}</p>
        <Link href="/dashboard" className="text-primary mt-4 inline-block hover:underline">Kembali</Link>
      </div>
    );
  }

  const handleSelect = (value: number) => {
    setAnswers({ ...answers, [questions[currentStep].id]: value });
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/assessment/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        });
        if (res.ok) {
          const data = await res.json();
          const a = data.assessment;
          const params = new URLSearchParams({
            score: String(a.score),
            maxScore: String(a.maxScore),
            percentage: String(a.percentage),
            label: a.label,
            recommendation: a.recommendation,
          });
          router.push(`/assessment/result?${params.toString()}`);
        } else {
          const data = await res.json();
          setError(data.error || 'Gagal mengirim jawaban.');
          setIsSubmitting(false);
        }
      } catch {
        setError('Terjadi kesalahan jaringan.');
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const currentQ = questions[currentStep];
  const isAnswered = answers[currentQ.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
      <div className="bg-white rounded-3xl shadow-sm border border-border p-8 md:p-12">
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-muted-foreground mb-2">
            <span>Pertanyaan {currentStep + 1} dari {questions.length}</span>
            <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }} />
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 leading-tight">{currentQ.text}</h2>
        <div className="space-y-4 mb-12">
          {options.map((option) => (
            <button key={option.value} onClick={() => handleSelect(option.value)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all flex items-center justify-between ${
                answers[currentQ.id] === option.value
                  ? 'border-primary bg-teal-50 text-primary'
                  : 'border-border hover:border-primary/50 text-foreground'
              }`}>
              <span className="text-lg font-medium">{option.label}</span>
              {answers[currentQ.id] === option.value && <CheckCircle2 className="w-6 h-6" />}
            </button>
          ))}
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="flex justify-between items-center border-t border-border pt-6">
          <button onClick={handleBack} disabled={currentStep === 0}
            className={`px-6 py-3 font-medium rounded-lg transition-colors ${currentStep === 0 ? 'text-muted-foreground/50 cursor-not-allowed' : 'text-foreground hover:bg-slate-100'}`}>
            Sebelumnya
          </button>
          <button onClick={handleNext} disabled={!isAnswered || isSubmitting}
            className={`px-8 py-3 font-semibold rounded-lg flex items-center gap-2 transition-all ${
              !isAnswered || isSubmitting ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}>
            {isSubmitting ? 'Memproses...' : currentStep === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
            {!isSubmitting && currentStep < questions.length - 1 && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
