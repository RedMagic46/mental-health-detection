import { questionRepo, settingsRepo } from '@/lib/db';


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

  
  if (categoryParam) {
    const dbCategory = categoryMap[categoryParam.toLowerCase()] || categoryParam;
    filteredQuestions = filteredQuestions.filter(
      q => q.category && q.category.toLowerCase() === dbCategory.toLowerCase()
    );
  }

  
  if (config.selectionMode === 'manual' && config.manualQuestionIds.length > 0) {
    filteredQuestions = filteredQuestions.filter(q => config.manualQuestionIds.includes(q.id));
  }

  if (!categoryParam && config.displayCount === 21 && config.selectionMode === 'random') {
    const stressQ = filteredQuestions.filter(q => q.category && q.category.toLowerCase() === 'stress');
    const anxietyQ = filteredQuestions.filter(q => q.category && q.category.toLowerCase() === 'kecemasan');
    const depressionQ = filteredQuestions.filter(q => q.category && q.category.toLowerCase() === 'depresi');

    if (stressQ.length >= 7 && anxietyQ.length >= 7 && depressionQ.length >= 7) {
      filteredQuestions = [
        ...shuffle(stressQ).slice(0, 7),
        ...shuffle(anxietyQ).slice(0, 7),
        ...shuffle(depressionQ).slice(0, 7)
      ];
      if (config.randomizeOrder) {
        filteredQuestions = shuffle(filteredQuestions);
      }
    } else {
      filteredQuestions = shuffle(filteredQuestions).slice(0, 21);
    }
  } else {
    if (config.randomizeOrder || config.selectionMode === 'random') {
      filteredQuestions = shuffle(filteredQuestions);
    } else {
      filteredQuestions.sort((a, b) => a.id - b.id);
    }

    if (config.displayCount > 0) {
      filteredQuestions = filteredQuestions.slice(0, config.displayCount);
    }
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
