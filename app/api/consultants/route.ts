import { requireStaff } from '@/lib/auth';
import { userRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const consultants = await userRepo.findConsultants();
  
  return Response.json({
    consultants: consultants.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
    })),
  });
}
