import { requireAdmin } from '@/lib/auth';
import { faqRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const faqId = parseInt(id);
  if (isNaN(faqId)) {
    return errorResponse('ID tidak valid.', 400);
  }

  try {
    const body = await request.json();
    const { question, answer } = body;

    const updated = await faqRepo.update(faqId, { question, answer });
    if (!updated) {
      return errorResponse('FAQ tidak ditemukan.', 404);
    }

    return Response.json({ faq: updated });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const faqId = parseInt(id);
  if (isNaN(faqId)) {
    return errorResponse('ID tidak valid.', 400);
  }

  const ok = await faqRepo.delete(faqId);
  if (!ok) {
    return errorResponse('Gagal menghapus FAQ.', 500);
  }

  return Response.json({ success: true });
}
