import { requireStaff } from '@/lib/auth';
import { moodRepo, consultationRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await requireStaff();
  if (!staff) {
    return errorResponse('Akses ditolak.', 403);
  }

  const { id: targetUserId } = await params;

  
  if (staff.role === 'consultant') {
    const isAssigned = await consultationRepo.hasAssignment(staff.id, targetUserId);
    if (!isAssigned) {
      return errorResponse('Akses ditolak. Anda tidak memiliki tiket yang di-assign untuk user ini.', 403);
    }
  }

  
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 7, 7), 30) : 30;

  const logs = await moodRepo.findByUserId(targetUserId, limit);

  
  const chartData = [...logs].reverse().map((m) => ({
    day: new Date(m.createdAt).toLocaleDateString('id-ID', { weekday: 'short' }),
    mood: m.moodValue,
  }));

  return Response.json({
    moodLogs: logs,
    chartData,
  });
}
