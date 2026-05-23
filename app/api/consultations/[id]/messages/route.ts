import { requireAuth } from '@/lib/auth';
import { consultationRepo, chatMessageRepo } from '@/lib/db';
import { isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Unauthorized.', 401);
  }

  const { id } = await params;

  // Verify user owns this consultation
  const consultation = await consultationRepo.findById(id);
  if (!consultation || consultation.userId !== user.id) {
    return errorResponse('Konsultasi tidak ditemukan.', 404);
  }

  const messages = await chatMessageRepo.findByConsultationId(id);
  return Response.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Unauthorized.', 401);
  }

  const { id } = await params;

  // Verify user owns this consultation
  const consultation = await consultationRepo.findById(id);
  if (!consultation || consultation.userId !== user.id) {
    return errorResponse('Konsultasi tidak ditemukan.', 404);
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!isNonEmptyString(message)) {
      return errorResponse('Pesan harus diisi.', 400);
    }

    const chatMessage = await chatMessageRepo.create({
      consultationId: id,
      senderId: user.id,
      senderRole: 'user',
      message: sanitize(message),
    });

    // Update consultation status to in_progress if it was new
    if (consultation.status === 'new') {
      await consultationRepo.updateStatus(id, 'in_progress');
    }

    return Response.json({ message: chatMessage }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
