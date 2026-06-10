import { requireStaff } from '@/lib/auth';
import { chatMessageRepo, consultationRepo } from '@/lib/db';
import { isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';
import { sendChatMessageNotification } from '@/lib/email';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const consultation = await consultationRepo.findById(id);
  if (!consultation) {
    return errorResponse('Konsultasi tidak ditemukan.', 404);
  }

  if (staff.role === 'consultant' && consultation.assignedConsultantId !== staff.id) {
    return errorResponse('Akses ditolak. Tiket ini tidak di-assign ke Anda.', 403);
  }

  const messages = await chatMessageRepo.findByConsultationId(id);
  return Response.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id } = await params;
  const consultation = await consultationRepo.findById(id);
  if (!consultation) {
    return errorResponse('Konsultasi tidak ditemukan.', 404);
  }

  if (staff.role === 'consultant' && consultation.assignedConsultantId !== staff.id) {
    return errorResponse('Akses ditolak. Tiket ini tidak di-assign ke Anda.', 403);
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!isNonEmptyString(message)) {
      return errorResponse('Pesan harus diisi.', 400);
    }

    const chatMessage = await chatMessageRepo.create({
      consultationId: id,
      senderId: staff.id,
      senderRole: staff.role,
      message: sanitize(message),
    });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const chatLink = `${origin}/consultations`;
    
    sendChatMessageNotification(consultation.email, consultation.name, chatMessage.message, chatLink).catch((err) => {
      console.error('Error sending chat reply notification email:', err);
    });

    return Response.json({ message: chatMessage }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
