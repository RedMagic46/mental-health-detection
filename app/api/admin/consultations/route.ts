import { requireStaff } from '@/lib/auth';
import { consultationRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const consultations =
    staff.role === 'admin'
      ? await consultationRepo.findAll()
      : await consultationRepo.findByAssignedConsultant(staff.id);

  return Response.json({ consultations });
}
