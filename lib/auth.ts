// ============================================================
// Authentication helpers
// JWT-based session with HttpOnly cookies
// ============================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { userRepo } from './db';
import type { JwtPayload, SafeUser, User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'mindcare-dev-secret-change-in-production';
const COOKIE_NAME = 'mindcare_session';
const TOKEN_EXPIRY = '7d';
const SALT_ROUNDS = 10;

// --------------- Password helpers ---------------

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --------------- JWT helpers ---------------

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// --------------- Cookie helpers ---------------

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

// --------------- Auth guards ---------------

/** Strip passwordHash from User object */
export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

/**
 * Require authenticated user. Returns SafeUser or null.
 * Use in Route Handlers to protect endpoints.
 */
export async function requireAuth(): Promise<SafeUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await userRepo.findById(payload.userId);
  if (!user) return null;

  return toSafeUser(user);
}

/**
 * Require admin user. Returns SafeUser or null.
 */
export async function requireAdmin(): Promise<SafeUser | null> {
  const user = await requireAuth();
  if (!user || user.role !== 'admin') return null;
  return user;
}
