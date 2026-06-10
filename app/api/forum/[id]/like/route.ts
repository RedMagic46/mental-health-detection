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
    return errorResponse('Anda harus masuk terlebih dahulu untuk menyukai diskusi ini.', 401);
  }

  try {
    const result = await forumRepo.toggleLike(id, user.id);
    return Response.json(result);
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
