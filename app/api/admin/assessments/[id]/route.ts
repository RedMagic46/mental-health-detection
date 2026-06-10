import { requireAdmin } from '@/lib/auth';
import { assessmentRepo } from '@/lib/db';
import { errorResponse } from '@/lib/validation';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const { id } = await params;
    const deleted = await assessmentRepo.delete(id);
    if (!deleted) {
      return errorResponse('Gagal menghapus riwayat tes.', 500);
    }

    return Response.json({ message: 'Riwayat tes berhasil dihapus.' });
  } catch (error) {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
