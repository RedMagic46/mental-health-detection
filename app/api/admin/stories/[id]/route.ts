import { requireAdmin } from '@/lib/auth';
import { successStoryRepo } from '@/lib/db';
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
  const storyId = parseInt(id);
  if (isNaN(storyId)) {
    return errorResponse('ID tidak valid.', 400);
  }

  try {
    const body = await request.json();
    const { title, content, authorName, authorRole, rating } = body;

    const updated = await successStoryRepo.update(storyId, {
      title,
      content,
      authorName,
      authorRole,
      rating: rating !== undefined ? parseInt(rating) : undefined,
    });

    if (!updated) {
      return errorResponse('Cerita sukses tidak ditemukan.', 404);
    }

    return Response.json({ story: updated });
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
  const storyId = parseInt(id);
  if (isNaN(storyId)) {
    return errorResponse('ID tidak valid.', 400);
  }

  const ok = await successStoryRepo.delete(storyId);
  if (!ok) {
    return errorResponse('Gagal menghapus cerita sukses.', 500);
  }

  return Response.json({ success: true });
}
