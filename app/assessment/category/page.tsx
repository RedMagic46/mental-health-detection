'use client';

import Link from 'next/link';
import { ArrowLeft, Brain, Activity, HeartCrack } from 'lucide-react';

const categories = [
  {
    id: 'anxiety',
    name: 'Anxiety (Kecemasan)',
    description: 'Evaluasi tingkat kecemasan, rasa gugup, atau kekhawatiran yang berlebihan.',
    icon: Activity,
    color: 'bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-500 hover:bg-blue-50',
  },
  {
    id: 'stress',
    name: 'Stress (Stres)',
    description: 'Ukur seberapa sering Anda merasa tertekan, kewalahan, atau tegang.',
    icon: Brain,
    color: 'bg-amber-100 text-amber-700 border-amber-200 hover:border-amber-500 hover:bg-amber-50',
  },
  {
    id: 'depresi',
    name: 'Depresi (Depression)',
    description: 'Kenali tanda-tanda depresi seperti kesedihan mendalam atau hilangnya minat.',
    icon: HeartCrack,
    color: 'bg-purple-100 text-purple-700 border-purple-200 hover:border-purple-500 hover:bg-purple-50',
  },
];

export default function CategorySelectionPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-grow">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
      
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Pilih Kategori Tes</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Silakan pilih area spesifik yang ingin Anda evaluasi hari ini. Pertanyaan akan disesuaikan dengan kategori yang Anda pilih.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link 
              key={category.id} 
              href={`/assessment?category=${category.id}`}
              className={`flex flex-col p-8 rounded-3xl border-2 transition-all duration-300 group ${category.color}`}
            >
              <div className="bg-white/60 p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{category.name}</h2>
              <p className="opacity-90 leading-relaxed">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
