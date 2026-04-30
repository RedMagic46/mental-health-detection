import { seedAdmin } from '@/lib/seed';
import { errorResponse } from '@/lib/validation';

// Seed admin — disabled in production, protected by optional secret in dev
export async function GET(request: Request) {
  // Block in production entirely
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Endpoint tidak tersedia.', 404);
  }

  // Optional: require a secret query param in dev
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const seedSecret = process.env.SEED_SECRET;
  if (seedSecret && secret !== seedSecret) {
    return errorResponse('Akses ditolak.', 403);
  }

  const admin = await seedAdmin();
  return Response.json({
    message: 'Seed berhasil.',
    admin: { email: admin.email, role: admin.role },
  });
}
