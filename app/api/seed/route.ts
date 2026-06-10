import { seedAll } from '@/lib/seed';
import { errorResponse } from '@/lib/validation';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Endpoint tidak tersedia.', 404);
  }

  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const seedSecret = process.env.SEED_SECRET;
  
  if (!seedSecret || secret !== seedSecret) {
    return errorResponse('Akses ditolak.', 403);
  }

  const admin = await seedAll();
  return Response.json({
    message: 'Seed berhasil.',
    admin: { email: admin.email, role: admin.role },
  });
}
