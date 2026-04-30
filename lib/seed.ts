// ============================================================
// Seed script: creates a default admin account
// Run: npx tsx lib/seed.ts  (or import in a route handler)
// ============================================================

import { userRepo } from './db';
import { hashPassword } from './auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@mindcare.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_NAME = 'Administrator';

export async function seedAdmin() {
  // Only seed if admin doesn't exist
  const existing = await userRepo.findByEmail(ADMIN_EMAIL);
  if (existing) return existing;

  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const admin = await userRepo.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    passwordHash,
    role: 'admin',
  });

  console.log(`[seed] Admin created: ${admin.email}`);
  return admin;
}
