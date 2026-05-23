import { questionRepo, settingsRepo } from '@/lib/db';

/** Fisher-Yates shuffle — produces unbiased random ordering */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get('category');

  const [questions, config] = await Promise.all([
    questionRepo.findAll(),
    settingsRepo.getConfig(),
  ]);

  let filteredQuestions = [...questions];

  const categoryMap: Record<string, string> = {
    'anxiety': 'Kecemasan',
    'stress': 'Stress',
    'depresi': 'Depresi',
  };

  // 1. Filter berdasarkan kategori jika dipilih di interface user
  if (categoryParam) {
    const dbCategory = categoryMap[categoryParam.toLowerCase()] || categoryParam;
    filteredQuestions = filteredQuestions.filter(
      q => q.category && q.category.toLowerCase() === dbCategory.toLowerCase()
    );
  }

  // 2. Filter dengan pilihan manual admin jika mode pemilihan manual aktif
  if (config.selectionMode === 'manual' && config.manualQuestionIds.length > 0) {
    filteredQuestions = filteredQuestions.filter(q => config.manualQuestionIds.includes(q.id));
  }

  // 3. Acak urutan pertanyaan jika "Acak Urutan" aktif atau menggunakan mode "Acak (Random)"
  if (config.randomizeOrder || config.selectionMode === 'random') {
    filteredQuestions = shuffle(filteredQuestions);
  } else {
    // Urutkan default secara menaik berdasarkan ID (Primary Key) jika tidak diacak
    filteredQuestions.sort((a, b) => a.id - b.id);
  }

  // 4. Batasi jumlah pertanyaan sesuai dengan konfigurasi "Jumlah Pertanyaan Tampil"
  if (config.displayCount > 0) {
    filteredQuestions = filteredQuestions.slice(0, config.displayCount);
  }

  return Response.json(
    { questions: filteredQuestions },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
