import { requireAdmin } from '@/lib/auth';
import { assessmentRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const assessments = await assessmentRepo.findAll();
  return Response.json({ assessments });
}
