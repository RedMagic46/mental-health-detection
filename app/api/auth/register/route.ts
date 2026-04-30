import { userRepo } from '@/lib/db';
import { hashPassword, createToken, setSessionCookie } from '@/lib/auth';
import { isValidEmail, isValidPassword, isNonEmptyString, sanitize, errorResponse } from '@/lib/validation';
import type { JwtPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate inputs
    if (!isNonEmptyString(name)) {
      return errorResponse('Nama harus diisi.', 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse('Format email tidak valid.', 400);
    }
    if (!isValidPassword(password)) {
      return errorResponse('Password minimal 6 karakter.', 400);
    }

    // Check if email already taken
    if (await userRepo.findByEmail(email)) {
      return errorResponse('Email sudah terdaftar.', 409);
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({
      name: sanitize(name),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'user',
    });

    // Create session
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const token = createToken(payload);
    await setSessionCookie(token);

    return Response.json(
      {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        message: 'Registrasi berhasil.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register Error]:', error);
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
