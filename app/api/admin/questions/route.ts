import { requireAdmin } from '@/lib/auth';
import { questionRepo } from '@/lib/db';
import { isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const questions = await questionRepo.findAll();
  return Response.json({ questions });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const body = await request.json();
    const { text, category, weight } = body;

    if (!isNonEmptyString(text)) {
      return errorResponse('Teks pertanyaan harus diisi.', 400);
    }

    const question = await questionRepo.create({
      text: sanitize(text),
      category: isNonEmptyString(category) ? sanitize(category) : 'Umum',
      weight: typeof weight === 'number' && weight > 0 ? weight : 1,
    });

    return Response.json({ question }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
