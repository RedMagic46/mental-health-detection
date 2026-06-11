import { requireAuth } from '@/lib/auth';
import { assessmentRepo, questionRepo } from '@/lib/db';
import { runMLInference } from '@/lib/assessment/mlInference';
import { errorResponse } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers } = body;


    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return errorResponse('Format jawaban tidak valid.', 400);
    }


    const answerEntries = Object.entries(answers);
    if (answerEntries.length === 0) {
      return errorResponse('Jawaban tidak boleh kosong.', 400);
    }

    for (const [key, value] of answerEntries) {
      if (typeof value !== 'number' || value < 0 || value > 3) {
        return errorResponse(`Nilai jawaban untuk pertanyaan ${key} tidak valid (harus 0-3).`, 400);
      }
    }


    const numericAnswers: Record<number, number> = {};
    for (const [key, value] of answerEntries) {
      numericAnswers[parseInt(key, 10)] = value as number;
    }

    const allQuestions = await questionRepo.findAll();
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    const depAnswers: number[] = [];
    const anxAnswers: number[] = [];
    const strAnswers: number[] = [];

    const sortedAnswerKeys = Object.keys(numericAnswers)
      .map(Number)
      .sort((a, b) => a - b);

    for (const qId of sortedAnswerKeys) {
      const q = questionMap.get(qId);
      const answerVal = numericAnswers[qId];
      if (q && answerVal !== undefined) {
        const cat = q.category.toLowerCase();
        if (cat === 'depresi') {
          depAnswers.push(answerVal);
        } else if (cat === 'kecemasan') {
          anxAnswers.push(answerVal);
        } else if (cat === 'stress') {
          strAnswers.push(answerVal);
        }
      }
    }

    const virtualAnswers: Record<number, number> = {};
    const strVirtualIds = [1, 6, 8, 11, 12, 14, 18];
    const anxVirtualIds = [2, 4, 7, 9, 15, 19, 20];
    const depVirtualIds = [3, 5, 10, 13, 16, 17, 21];

    for (let i = 0; i < 7; i++) {
      if (strAnswers[i] !== undefined) virtualAnswers[strVirtualIds[i]] = strAnswers[i];
      if (anxAnswers[i] !== undefined) virtualAnswers[anxVirtualIds[i]] = anxAnswers[i];
      if (depAnswers[i] !== undefined) virtualAnswers[depVirtualIds[i]] = depAnswers[i];
    }


    const mlResult = runMLInference(virtualAnswers);


    const user = await requireAuth();

    
    const answersWithMlResult = {
      ...numericAnswers,
      ml_result: {
        depression: {
          score: mlResult.depression.score,
          predictedClass: mlResult.depression.predictedClass,
          level: mlResult.depression.level,
        },
        anxiety: {
          score: mlResult.anxiety.score,
          predictedClass: mlResult.anxiety.predictedClass,
          level: mlResult.anxiety.level,
        },
        stress: {
          score: mlResult.stress.score,
          predictedClass: mlResult.stress.predictedClass,
          level: mlResult.stress.level,
        }
      }
    };

    
    
    const totalScore = mlResult.depression.score + mlResult.anxiety.score + mlResult.stress.score;

    const assessment = await assessmentRepo.create({
      userId: user?.id ?? null,
      answers: answersWithMlResult as any, 
      score: totalScore,
      label: mlResult.overallLabel,
      recommendation: mlResult.recommendation,
    });

    return Response.json({
      assessment: {
        id: assessment.id,
        score: totalScore,
        maxScore: 126,
        percentage: Math.round((totalScore / 126) * 100),
        label: assessment.label,
        recommendation: assessment.recommendation,
        mlResult: {
          depression: mlResult.depression,
          anxiety: mlResult.anxiety,
          stress: mlResult.stress,
        },
        createdAt: assessment.createdAt,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in assessment submit API:', error);
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
