import { userRepo, passwordResetRepo } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { isValidEmail, isValidPassword, errorResponse } from '@/lib/validation';

// Rate limiter for OTP verification attempts
const verifyAttemptLog = new Map<string, { count: number; blockedUntil: number }>();
const MAX_VERIFY_ATTEMPTS = 5; // max 5 attempts
const BLOCK_DURATION_MS = 30 * 60 * 1000; // block for 30 minutes after exceeding

function isVerifyBlocked(email: string): boolean {
  const now = Date.now();
  const entry = verifyAttemptLog.get(email);

  if (!entry) return false;
  if (now > entry.blockedUntil) {
    verifyAttemptLog.delete(email);
    return false;
  }

  return entry.count >= MAX_VERIFY_ATTEMPTS;
}

function recordVerifyAttempt(email: string): void {
  const now = Date.now();
  const entry = verifyAttemptLog.get(email);

  if (!entry || now > entry.blockedUntil) {
    verifyAttemptLog.set(email, { count: 1, blockedUntil: now + BLOCK_DURATION_MS });
  } else {
    entry.count++;
  }
}

function clearVerifyAttempts(email: string): void {
  verifyAttemptLog.delete(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, otp, newPassword } = body;

    if (!isValidEmail(email) || !otp || !newPassword) {
      return errorResponse('Data tidak lengkap.', 400);
    }

    if (!isValidPassword(newPassword)) {
      return errorResponse('Password minimal 6 karakter.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if this email is blocked from too many attempts
    if (isVerifyBlocked(normalizedEmail)) {
      return errorResponse('Terlalu banyak percobaan. Silakan coba lagi nanti.', 429);
    }

    // Verify OTP
    const validReset = await passwordResetRepo.findValidOTP(normalizedEmail, otp);
    if (!validReset) {
      // Record failed attempt
      recordVerifyAttempt(normalizedEmail);
      return errorResponse('Kode OTP tidak valid atau sudah kadaluwarsa.', 400);
    }

    // OTP valid — clear attempt counter
    clearVerifyAttempts(normalizedEmail);

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    const updated = await userRepo.updatePassword(normalizedEmail, passwordHash);
    if (!updated) {
      return errorResponse('Gagal memperbarui password.', 500);
    }

    // Delete the used OTP
    await passwordResetRepo.deleteByEmail(normalizedEmail);

    return Response.json({ message: 'Password berhasil diperbarui. Silakan login kembali.' });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}

