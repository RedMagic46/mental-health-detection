import { requireAdmin } from '@/lib/auth';
import { faqRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const faqs = await faqRepo.findAll();
  return Response.json({ faqs });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const body = await request.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return errorResponse('Pertanyaan dan jawaban wajib diisi.', 400);
    }

    const faq = await faqRepo.create({ question, answer });
    return Response.json({ faq }, { status: 201 });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
