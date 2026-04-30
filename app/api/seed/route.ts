import { seedAdmin } from '@/lib/seed';

// Seed admin on first GET to /api/seed
// This is a convenience endpoint for development
export async function GET() {
  const admin = await seedAdmin();
  return Response.json({
    message: 'Seed berhasil.',
    admin: { email: admin.email, role: admin.role },
  });
}
