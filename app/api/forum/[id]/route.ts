import { requireAuth } from '@/lib/auth';
import { forumRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  let currentUserId: string | undefined;
  let currentUserRole: string | undefined;
  try {
    const user = await requireAuth();
    if (user) {
      currentUserId = user.id;
      currentUserRole = user.role;
    }
  } catch {
    
  }

  const thread = await forumRepo.findThreadById(id, currentUserId);
  if (!thread) {
    return errorResponse('Diskusi tidak ditemukan.', 404);
  }

  
  if (thread.isPrivate) {
    if (!currentUserId || (currentUserId !== thread.userId && currentUserRole !== 'admin')) {
      return errorResponse('Akses ditolak. Diskusi ini bersifat privat.', 403);
    }
  }

  const comments = await forumRepo.findCommentsByThreadId(id);

  return Response.json({ thread, comments });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Anda harus masuk terlebih dahulu.', 401);
  }

  const thread = await forumRepo.findThreadById(id);
  if (!thread) {
    return errorResponse('Diskusi tidak ditemukan.', 404);
  }

  
  if (user.role !== 'admin' && thread.userId !== user.id) {
    return errorResponse('Akses ditolak. Anda hanya dapat menghapus diskusi buatan Anda sendiri.', 403);
  }

  const ok = await forumRepo.deleteThread(id);
  if (!ok) {
    return errorResponse('Gagal menghapus diskusi.', 500);
  }

  return Response.json({ success: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await requireAuth();
  if (!user) {
    return errorResponse('Anda harus masuk terlebih dahulu.', 401);
  }

  const thread = await forumRepo.findThreadById(id);
  if (!thread) {
    return errorResponse('Diskusi tidak ditemukan.', 404);
  }

  
  if (user.role !== 'admin' && thread.userId !== user.id) {
    return errorResponse('Akses ditolak. Anda hanya dapat mengubah status privasi diskusi buatan Anda sendiri.', 403);
  }

  try {
    const body = await request.json();
    const { isPrivate } = body;

    if (isPrivate === undefined) {
      return errorResponse('Parameter isPrivate wajib diisi.', 400);
    }

    const updated = await forumRepo.updateThreadPrivacy(id, !!isPrivate);
    if (!updated) {
      return errorResponse('Gagal memperbarui status privasi diskusi.', 500);
    }

    return Response.json({ success: true, thread: updated });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
