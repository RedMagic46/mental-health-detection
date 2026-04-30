import { userRepo } from '@/lib/db';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';
import { isValidEmail, isValidPassword, errorResponse } from '@/lib/validation';
import { seedAdmin } from '@/lib/seed';
import type { JwtPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    // Ensure admin exists (in-memory mode resets on cold start)
    await seedAdmin();

    const body = await request.json();
    const { email, password } = body;

    // Validate inputs
    if (!isValidEmail(email)) {
      return errorResponse('Format email tidak valid.', 400);
    }
    if (!isValidPassword(password)) {
      return errorResponse('Password minimal 6 karakter.', 400);
    }

    // Find user
    const user = await userRepo.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return errorResponse('Email atau password salah.', 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return errorResponse('Email atau password salah.', 401);
    }

    // Create session
    const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };
    const token = createToken(payload);
    await setSessionCookie(token);

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      message: 'Login berhasil.',
    });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
