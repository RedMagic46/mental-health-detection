import { requireAuth } from '@/lib/auth';
import { assessmentRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Silakan login untuk melihat riwayat.', 401);
  }

  const assessments = await assessmentRepo.findByUserId(user.id);

  return Response.json({
    assessments: assessments.map((a) => ({
      id: a.id,
      score: a.score,
      label: a.label,
      recommendation: a.recommendation,
      createdAt: a.createdAt,
    })),
  });
}
