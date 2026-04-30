import { requireAuth } from '@/lib/auth';
import { consultationRepo } from '@/lib/db';
import { isNonEmptyString, isValidEmail, sanitize, errorResponse } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!isNonEmptyString(message)) {
      return errorResponse('Pesan konsultasi harus diisi.', 400);
    }

    // User can be authenticated or anonymous
    const user = await requireAuth();

    const consultation = await consultationRepo.create({
      userId: user?.id ?? null,
      name: isNonEmptyString(name) ? sanitize(name) : (user?.name ?? 'Anonim'),
      email: isValidEmail(email) ? email.toLowerCase().trim() : (user?.email ?? ''),
      message: sanitize(message),
      status: 'new',
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
