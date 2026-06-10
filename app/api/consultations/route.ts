import { requireAuth } from '@/lib/auth';
import { consultationRepo, userRepo } from '@/lib/db';
import { isNonEmptyString, isValidEmail, isValidName, sanitize, errorResponse } from '@/lib/validation';
import { sendNewConsultationAlert } from '@/lib/email';

export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Unauthorized.', 401);
  }

  const consultations = await consultationRepo.findByUserId(user.id);
  return Response.json({ consultations });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!isNonEmptyString(message)) {
      return errorResponse('Pesan konsultasi harus diisi.', 400);
    }

    const user = await requireAuth();

    if (isNonEmptyString(name) && !isValidName(name)) {
      return errorResponse('Nama tidak valid. Tidak boleh mengandung tag HTML.', 400);
    }

    const consultation = await consultationRepo.create({
      userId: user?.id ?? null,
      name: isValidName(name) ? sanitize(name) : (user?.name ? sanitize(user.name) : 'Anonim'),
      email: isValidEmail(email) ? email.toLowerCase().trim() : (user?.email ?? ''),
      message: sanitize(message),
      status: 'new',
    });

    userRepo.findAll().then((users) => {
      const adminEmails = users.filter((u) => u.role === 'admin').map((u) => u.email);
      for (const adminEmail of adminEmails) {
        sendNewConsultationAlert(adminEmail, consultation.name, consultation.email, consultation.message);
      }
    }).catch((err) => {
      console.error('Error sending new consultation alert emails:', err);
    });

    return Response.json(
      {
        consultation: {
          id: consultation.id,
          status: consultation.status,
          createdAt: consultation.createdAt,
        },
        message: 'Konsultasi berhasil dikirim.',
      },
      { status: 201 }
    );
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
