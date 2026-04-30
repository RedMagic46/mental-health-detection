import { requireAdmin } from '@/lib/auth';
import { consultationRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const consultations = await consultationRepo.findAll();
  return Response.json({ consultations });
}
