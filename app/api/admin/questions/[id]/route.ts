import { requireAdmin } from '@/lib/auth';
import { questionRepo } from '@/lib/db';
import { isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';

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
    const questionId = parseInt(id, 10);
    if (isNaN(questionId)) {
      return errorResponse('ID pertanyaan tidak valid.', 400);
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.text !== undefined) {
      if (!isNonEmptyString(body.text)) {
        return errorResponse('Teks pertanyaan tidak boleh kosong.', 400);
      }
      updates.text = sanitize(body.text);
    }
    if (body.category !== undefined) {
      updates.category = isNonEmptyString(body.category) ? sanitize(body.category) : 'Umum';
    }
    if (body.weight !== undefined) {
      updates.weight = typeof body.weight === 'number' && body.weight > 0 ? body.weight : 1;
    }

    const updated = await questionRepo.update(questionId, updates);
    if (!updated) {
      return errorResponse('Pertanyaan tidak ditemukan.', 404);
    }

    return Response.json({ question: updated });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const questionId = parseInt(id, 10);
  if (isNaN(questionId)) {
    return errorResponse('ID pertanyaan tidak valid.', 400);
  }

  const deleted = await questionRepo.delete(questionId);
  if (!deleted) {
    return errorResponse('Pertanyaan tidak ditemukan.', 404);
  }

  return Response.json({ message: 'Pertanyaan berhasil dihapus.' });
}
