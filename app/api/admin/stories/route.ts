import { requireAdmin } from '@/lib/auth';
import { successStoryRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const stories = await successStoryRepo.findAll();
  return Response.json({ stories });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const body = await request.json();
    const { title, content, authorName, authorRole, rating } = body;

    if (!title || !content || !authorName || rating === undefined) {
      return errorResponse('Judul, isi, nama penulis, dan rating wajib diisi.', 400);
    }

    const story = await successStoryRepo.create({
      title,
      content,
      authorName,
      authorRole: authorRole || 'Pengguna',
      rating: parseInt(rating) || 5,
    });
    return Response.json({ story }, { status: 201 });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
