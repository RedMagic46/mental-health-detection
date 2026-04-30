import { requireAdmin } from '@/lib/auth';
import { userRepo, assessmentRepo, consultationRepo, questionRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  return Response.json({
    stats: {
      totalUsers: await userRepo.count(),
      totalAssessments: await assessmentRepo.count(),
      totalConsultations: await consultationRepo.count(),
      totalQuestions: await questionRepo.count(),
      consultationsByStatus: {
        new: await consultationRepo.countByStatus('new'),
        in_progress: await consultationRepo.countByStatus('in_progress'),
        done: await consultationRepo.countByStatus('done'),
      },
    },
  });
}
