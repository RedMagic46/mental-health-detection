import { requireAuth } from '@/lib/auth';
import { assessmentRepo, questionRepo } from '@/lib/db';
import { evaluateAssessment } from '@/lib/assessment/rules';
import { errorResponse } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers } = body;

    // Validate answers is an object
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return errorResponse('Format jawaban tidak valid.', 400);
    }

    // Validate each answer value is 0-3
    const answerEntries = Object.entries(answers);
    if (answerEntries.length === 0) {
      return errorResponse('Jawaban tidak boleh kosong.', 400);
    }

    for (const [key, value] of answerEntries) {
      if (typeof value !== 'number' || value < 0 || value > 3) {
        return errorResponse(`Nilai jawaban untuk pertanyaan ${key} tidak valid (harus 0-3).`, 400);
      }
    }

    // Convert keys to numbers
    const numericAnswers: Record<number, number> = {};
    for (const [key, value] of answerEntries) {
      numericAnswers[parseInt(key, 10)] = value as number;
    }

    // Get questions and evaluate
    const questions = await questionRepo.findAll();
    const result = evaluateAssessment(numericAnswers, questions);

    // Get current user if logged in (assessment can be anonymous)
    const user = await requireAuth();

    // Save assessment
    const assessment = await assessmentRepo.create({
      userId: user?.id ?? null,
      answers: numericAnswers,
      score: result.score,
      label: result.label,
      recommendation: result.recommendation,
    });

    return Response.json({
      assessment: {
        id: assessment.id,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        label: result.label,
        recommendation: result.recommendation,
        subscores: result.subscores,
        createdAt: assessment.createdAt,
      },
    }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
