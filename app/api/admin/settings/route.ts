import { settingsRepo } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errorResponse('Unauthorized', 401);

  const config = await settingsRepo.getConfig();
  return Response.json({ config });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse('Unauthorized', 401);

  try {
    const body = await request.json();

    // Validate input types and values before passing to repo
    const validated: Record<string, unknown> = {};

    if (body.displayCount !== undefined) {
      const count = parseInt(body.displayCount);
      if (isNaN(count) || count < 1 || count > 200) {
        return errorResponse('displayCount harus berupa angka antara 1 dan 200.', 400);
      }
      validated.displayCount = count;
    }

    if (body.selectionMode !== undefined) {
      if (body.selectionMode !== 'manual' && body.selectionMode !== 'random') {
        return errorResponse('selectionMode harus "manual" atau "random".', 400);
      }
      validated.selectionMode = body.selectionMode;
    }

    if (body.manualQuestionIds !== undefined) {
      if (!Array.isArray(body.manualQuestionIds) || !body.manualQuestionIds.every((id: unknown) => typeof id === 'number' && Number.isInteger(id))) {
        return errorResponse('manualQuestionIds harus berupa array angka.', 400);
      }
      validated.manualQuestionIds = body.manualQuestionIds;
    }

    if (body.randomizeOrder !== undefined) {
      if (typeof body.randomizeOrder !== 'boolean') {
        return errorResponse('randomizeOrder harus berupa boolean.', 400);
      }
      validated.randomizeOrder = body.randomizeOrder;
    }

    const success = await settingsRepo.updateConfig(validated);
    
    if (!success) {
      return errorResponse('Gagal menyimpan pengaturan.', 500);
    }

    return Response.json({ message: 'Pengaturan berhasil disimpan.' });
  } catch {
    return errorResponse('Request tidak valid.', 400);
  }
}

