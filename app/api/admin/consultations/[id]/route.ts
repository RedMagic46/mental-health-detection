import { requireAdmin } from '@/lib/auth';
import { consultationRepo } from '@/lib/db';
import { isValidConsultationStatus, errorResponse } from '@/lib/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!isValidConsultationStatus(status)) {
      return errorResponse('Status tidak valid. Gunakan: new, in_progress, atau done.', 400);
    }

    const updated = await consultationRepo.updateStatus(id, status);
    if (!updated) {
      return errorResponse('Konsultasi tidak ditemukan.', 404);
    }

    return Response.json({ consultation: updated });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
