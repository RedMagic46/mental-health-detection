import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  try {
    const { error } = await supabaseAdmin
      .from('questions')
      .select('id')
      .limit(1);

    if (error) {
      return errorResponse('Database connection failed: ' + error.message, 500);
    }

    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err: any) {
    return errorResponse(err.message || 'System unhealthy', 500);
  }
}
