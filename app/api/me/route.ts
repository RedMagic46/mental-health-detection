import { requireAuth } from '@/lib/auth';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Tidak terautentikasi.', 401);
  }
  return Response.json({ user });
}
