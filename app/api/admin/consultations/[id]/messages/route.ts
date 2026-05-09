import { requireAdmin } from '@/lib/auth';
import { chatMessageRepo } from '@/lib/db';
import { isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const messages = await chatMessageRepo.findByConsultationId(id);
  return Response.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { message } = body;

    if (!isNonEmptyString(message)) {
      return errorResponse('Pesan harus diisi.', 400);
    }

    const chatMessage = await chatMessageRepo.create({
      consultationId: id,
      senderId: admin.id,
      senderRole: 'admin',
      message: sanitize(message),
    });

    return Response.json({ message: chatMessage }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
