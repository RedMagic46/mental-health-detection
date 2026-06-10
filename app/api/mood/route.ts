import { requireAuth } from '@/lib/auth';
import { moodRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Silakan login untuk mengakses mood tracker.', 401);
  }

  const logs = await moodRepo.findByUserId(user.id);
  const todayMood = await moodRepo.findTodayMood(user.id);

  
  const chartData = logs.map((m) => ({
    day: new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
    mood: m.moodValue,
  }));

  return Response.json({
    moodLogs: logs,
    chartData,
    todayMood: todayMood || null,
  });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Silakan login untuk menyimpan mood.', 401);
  }

  try {
    const { mood } = await request.json();
    if (!mood || !['good', 'neutral', 'bad'].includes(mood)) {
      return errorResponse('Pilihan mood tidak valid.', 400);
    }

    const moodValue = mood === 'good' ? 5 : mood === 'neutral' ? 3 : 1;

    
    const todayMood = await moodRepo.findTodayMood(user.id);
    let result;

    if (todayMood) {
      
      result = await moodRepo.update(todayMood.id, { mood, moodValue });
    } else {
      
      result = await moodRepo.create({
        userId: user.id,
        mood,
        moodValue,
      });
    }

    
    const logs = await moodRepo.findByUserId(user.id);
    const chartData = logs.map((m) => ({
      day: new Date(m.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      mood: m.moodValue,
    }));

    return Response.json({
      success: true,
      message: 'Mood berhasil disimpan.',
      todayMood: result,
      chartData,
    });
  } catch (err: any) {
    return errorResponse(err.message || 'Terjadi kesalahan server.', 500);
  }
}
