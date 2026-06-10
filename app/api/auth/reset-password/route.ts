import { userRepo, passwordResetRepo } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { isValidEmail, isValidPassword, errorResponse } from '@/lib/validation';

const verifyAttemptLog = new Map<string, { count: number; blockedUntil: number }>();
const MAX_VERIFY_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

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

    
    if (isVerifyBlocked(normalizedEmail)) {
      return errorResponse('Terlalu banyak percobaan. Silakan coba lagi nanti.', 429);
    }

    
    const validReset = await passwordResetRepo.findValidOTP(normalizedEmail, otp);
    if (!validReset) {
      
      recordVerifyAttempt(normalizedEmail);
      return errorResponse('Kode OTP tidak valid atau sudah kadaluwarsa.', 400);
    }

    
    clearVerifyAttempts(normalizedEmail);

    
    const passwordHash = await hashPassword(newPassword);

    
    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      return errorResponse('Pengguna tidak ditemukan.', 404);
    }

    
    const updated = await userRepo.update(user.id, { passwordHash });
    if (!updated) {
      return errorResponse('Gagal memperbarui password.', 500);
    }

    
    await passwordResetRepo.deleteByEmail(normalizedEmail);

    return Response.json({ message: 'Password berhasil diperbarui. Silakan login kembali.' });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}

