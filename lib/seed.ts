// ============================================================
// Seed script: creates a default admin account
// Run: npx tsx lib/seed.ts  (or import in a route handler)
// ============================================================

import { userRepo } from './db';
import { hashPassword } from './auth';

export async function seedAdmin() {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL dan ADMIN_PASSWORD harus di-set di environment variables.');
  }

  // Only seed if admin doesn't exist
  const existing = await userRepo.findByEmail(ADMIN_EMAIL);
  if (existing) return existing;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await userRepo.create({
    name: 'Administrator',
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });

  console.log(`[seed] Admin created: ${admin.email}`);
  return admin;
}
