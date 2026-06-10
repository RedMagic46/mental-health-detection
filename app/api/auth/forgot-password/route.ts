import crypto from 'crypto';
import { userRepo, passwordResetRepo } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';
import { isValidEmail, errorResponse } from '@/lib/validation';


const otpRequestLog = new Map<string, { count: number; lastSentAt: number; windowResetAt: number }>();
const COOLDOWN_MS = 2 * 60 * 1000; 
const MAX_OTP_REQUESTS = 3; 
const OTP_WINDOW_MS = 15 * 60 * 1000; 

function checkRateLimit(email: string): { blocked: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = otpRequestLog.get(email);

  
  if (!entry || now > entry.windowResetAt) {
    otpRequestLog.set(email, { count: 1, lastSentAt: now, windowResetAt: now + OTP_WINDOW_MS });
    return { blocked: false };
  }

  
  if (entry.count >= MAX_OTP_REQUESTS) {
    const retryAfterSec = Math.ceil((entry.windowResetAt - now) / 1000);
    return { blocked: true, retryAfterSec };
  }

  
  const elapsed = now - entry.lastSentAt;
  if (elapsed < COOLDOWN_MS) {
    const retryAfterSec = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
    return { blocked: true, retryAfterSec };
  }

  
  entry.count++;
  entry.lastSentAt = now;
  return { blocked: false };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!isValidEmail(email)) {
      return errorResponse('Format email tidak valid.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    
    const rateCheck = checkRateLimit(normalizedEmail);
    if (rateCheck.blocked) {
      return Response.json({
        message: 'Silakan tunggu sebelum mengirim ulang kode OTP.',
        retryAfterSec: rateCheck.retryAfterSec,
      }, { status: 429 });
    }

    const user = await userRepo.findByEmail(normalizedEmail);
    if (!user) {
      
      return Response.json({ message: 'Jika email terdaftar, kode OTP akan dikirimkan.' });
    }

    
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    
    await passwordResetRepo.create(user.email, otp, expiresAt);

    
    const emailRes = await sendOTPEmail(user.email, otp);
    
    if (!emailRes.success) {
      
      return Response.json({ message: 'Jika email terdaftar, kode OTP akan dikirimkan.' });
    }

    return Response.json({ message: 'Jika email terdaftar, kode OTP akan dikirimkan.' });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}

