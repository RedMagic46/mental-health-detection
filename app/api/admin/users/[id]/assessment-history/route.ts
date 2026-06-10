import { requireStaff } from '@/lib/auth';
import { assessmentRepo, consultationRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id: targetUserId } = await params;

  
  if (staff.role === 'consultant') {
    const isAssigned = await consultationRepo.hasAssignment(staff.id, targetUserId);
    if (!isAssigned) {
      return errorResponse('Akses ditolak. Anda tidak memiliki tiket yang di-assign untuk user ini.', 403);
    }
  }

  const assessments = await assessmentRepo.findByUserId(targetUserId);

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
