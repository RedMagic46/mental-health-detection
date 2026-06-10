import { requireStaff } from '@/lib/auth';
import { consultationRepo, userRepo } from '@/lib/db';
import { isValidConsultationStatus, errorResponse } from '@/lib/validation';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const { id } = await params;
    const consultation = await consultationRepo.findById(id);
    if (!consultation) {
      return errorResponse('Konsultasi tidak ditemukan.', 404);
    }

    
    if (staff.role === 'consultant' && consultation.assignedConsultantId !== staff.id) {
      return errorResponse('Akses ditolak. Tiket ini tidak di-assign ke Anda.', 403);
    }

    const body = await request.json();
    const { status, assignedConsultantId, internalNotes } = body;

    const updates: any = {};

    
    if (assignedConsultantId !== undefined) {
      if (staff.role !== 'admin') {
        return errorResponse('Hanya admin yang dapat mengubah penugasan konsultan.', 403);
      }

      if (assignedConsultantId !== null) {
        const targetConsultant = await userRepo.findById(assignedConsultantId);
        if (!targetConsultant || targetConsultant.role !== 'consultant') {
          return errorResponse('User yang di-assign harus memiliki role consultant.', 400);
        }
      }

      updates.assignedConsultantId = assignedConsultantId;

      
      const currentStatus = status !== undefined ? status : consultation.status;
      if (assignedConsultantId !== null && currentStatus === 'new') {
        updates.status = 'in_progress';
      }
    }

    
    if (status !== undefined) {
      if (!isValidConsultationStatus(status)) {
        return errorResponse('Status tidak valid. Gunakan: new, in_progress, atau done.', 400);
      }
      updates.status = status;
    }

    
    if (internalNotes !== undefined) {
      updates.internalNotes = internalNotes;
    }

    const updated = await consultationRepo.update(id, updates);
    if (!updated) {
      return errorResponse('Gagal memperbarui data konsultasi.', 500);
    }

    return Response.json({ consultation: updated });
  } catch (err: any) {
    return errorResponse(err.message || 'Terjadi kesalahan server.', 500);
  }
}
