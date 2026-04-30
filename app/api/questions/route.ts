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

export async function GET() {
  const [questions, config] = await Promise.all([
    questionRepo.findAll(),
    settingsRepo.getConfig(),
  ]);

  let filteredQuestions = [...questions];

  // 1. Filter by manual selection if mode is manual
  if (config.selectionMode === 'manual' && config.manualQuestionIds.length > 0) {
    filteredQuestions = questions.filter(q => config.manualQuestionIds.includes(q.id));
  }

  // 2. Randomize order if enabled OR if mode is random (to pick random set)
  if (config.randomizeOrder || config.selectionMode === 'random') {
    filteredQuestions = shuffle(filteredQuestions);
  }

  // 3. Limit the count
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
