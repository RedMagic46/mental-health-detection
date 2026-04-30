import { questionRepo } from '@/lib/db';

export async function GET() {
  const questions = await questionRepo.findAll();
  return Response.json({ questions });
}
