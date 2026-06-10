import { requireAuth } from '@/lib/auth';
import { forumRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  
  
  let currentUserId: string | undefined;
  let currentUserRole: string | undefined;
  try {
    const user = await requireAuth();
    if (user) {
      currentUserId = user.id;
      currentUserRole = user.role;
    }
  } catch {
    
  }

  const threads = await forumRepo.findAllThreads({ category, search, currentUserId });
  
  
  const visibleThreads = threads.filter((t) => {
    if (t.isPrivate) {
      return currentUserId === t.userId || currentUserRole === 'admin';
    }
    return true;
  });

  return Response.json({ threads: visibleThreads });
}

export async function POST(request: Request) {
  const user = await requireAuth();
  if (!user) {
    return errorResponse('Anda harus masuk terlebih dahulu untuk membuat diskusi.', 401);
  }

  try {
    const body = await request.json();
    const { title, content, category, isAnonymous, isPrivate } = body;

    if (!title || !content || !category) {
      return errorResponse('Judul, isi, dan kategori wajib diisi.', 400);
    }

    const thread = await forumRepo.createThread({
      title,
      content,
      category,
      userId: user.id,
      isAnonymous: !!isAnonymous,
      isPrivate: !!isPrivate
    });

    return Response.json({ thread }, { status: 201 });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
