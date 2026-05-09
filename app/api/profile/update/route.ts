import { userRepo } from '@/lib/db';
import { requireAuth, createToken, setSessionCookie, toSafeUser } from '@/lib/auth';
import { isValidEmail, isValidName, sanitize, errorResponse } from '@/lib/validation';
import type { JwtPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return errorResponse('Tidak terautentikasi.', 401);
    }

    const body = await request.json();
    const { name, email } = body;

    // Validate inputs
    if (name && !isValidName(name)) {
      return errorResponse('Nama tidak valid.', 400);
    }
    if (email && !isValidEmail(email)) {
      return errorResponse('Format email tidak valid.', 400);
    }

    // Check if email already taken by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        return errorResponse('Email sudah digunakan oleh akun lain.', 409);
      }
    }

    // Update user
    const updatedUser = await userRepo.update(user.id, {
      name: name ? sanitize(name) : undefined,
      email: email ? email.toLowerCase().trim() : undefined,
    });

    if (!updatedUser) {
      return errorResponse('Gagal memperbarui profil.', 500);
    }

    // Refresh session cookie with new data
    const payload: JwtPayload = { 
      userId: updatedUser.id, 
      email: updatedUser.email, 
      role: updatedUser.role 
    };
    const token = createToken(payload);
    await setSessionCookie(token);

    return Response.json({
      user: toSafeUser(updatedUser),
      message: 'Profil berhasil diperbarui.',
    });
  } catch (error) {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
