import { userRepo } from '@/lib/db';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';
import { isValidEmail, isValidPassword, errorResponse } from '@/lib/validation';
import { seedAdmin } from '@/lib/seed';
import type { JwtPayload } from '@/lib/types';

// Simple in-memory rate limiter for login attempts
const loginAttemptLog = new Map<string, { count: number; blockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function isLoginBlocked(key: string): boolean {
  const now = Date.now();
  const entry = loginAttemptLog.get(key);
  if (!entry) return false;
  if (now > entry.blockedUntil) {
    loginAttemptLog.delete(key);
    return false;
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS;
}

function recordLoginAttempt(key: string): void {
  const now = Date.now();
  const entry = loginAttemptLog.get(key);
  if (!entry || now > entry.blockedUntil) {
    loginAttemptLog.set(key, { count: 1, blockedUntil: now + BLOCK_DURATION_MS });
  } else {
    entry.count++;
  }
}

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

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting check
    if (isLoginBlocked(normalizedEmail)) {
      return errorResponse('Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.', 429);
    }

    // Find user
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      recordLoginAttempt(normalizedEmail);
      return errorResponse('Email atau password salah.', 401);
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      recordLoginAttempt(normalizedEmail);
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

