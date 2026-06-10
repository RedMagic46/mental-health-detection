import { requireAuth } from '@/lib/auth';
import { forumRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Anda harus masuk terlebih dahulu untuk mengirim komentar.', 401);
  }

  try {
    const body = await request.json();
    const { content, isAnonymous } = body;

    if (!content) {
      return errorResponse('Komentar tidak boleh kosong.', 400);
    }

    const comment = await forumRepo.createComment({
      threadId: id,
      content,
      userId: user.id,
      isAnonymous: !!isAnonymous,
    });

    return Response.json({ comment }, { status: 201 });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
