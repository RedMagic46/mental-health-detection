import { requireAdmin, toSafeUser, hashPassword } from '@/lib/auth';
import { userRepo } from '@/lib/db';
import { isValidEmail, isValidPassword, isValidName, isValidRole, sanitize, errorResponse } from '@/lib/validation';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const { id } = await params;
    const existing = await userRepo.findById(id);
    if (!existing) {
      return errorResponse('User tidak ditemukan.', 404);
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    const updates: any = {};

    if (name !== undefined) {
      if (!isValidName(name)) {
        return errorResponse('Nama tidak valid. Tidak boleh mengandung karakter khusus atau tag HTML.', 400);
      }
      updates.name = sanitize(name);
    }

    if (email !== undefined) {
      if (!isValidEmail(email)) {
        return errorResponse('Format email tidak valid.', 400);
      }
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== existing.email) {
        const emailExists = await userRepo.findByEmail(normalizedEmail);
        if (emailExists) {
          return errorResponse('Email sudah terdaftar.', 409);
        }
      }
      updates.email = normalizedEmail;
    }

    if (role !== undefined) {
      if (!isValidRole(role)) {
        return errorResponse('Role tidak valid.', 400);
      }
      if (id === admin.id && role !== 'admin') {
        return errorResponse('Anda tidak dapat menurunkan peranan admin Anda sendiri.', 400);
      }
      updates.role = role;
    }

    if (password !== undefined && password !== '') {
      if (!isValidPassword(password)) {
        return errorResponse('Password minimal 6 karakter.', 400);
      }
      updates.passwordHash = await hashPassword(password);
    }

    const updated = await userRepo.update(id, updates);
    if (!updated) {
      return errorResponse('Gagal memperbarui user.', 500);
    }

    return Response.json({ 
      user: toSafeUser(updated)
    });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}

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
    
    if (id === admin.id) {
      return errorResponse('Anda tidak dapat menghapus akun Anda sendiri.', 400);
    }

    const existing = await userRepo.findById(id);
    if (!existing) {
      return errorResponse('User tidak ditemukan.', 404);
    }

    const deleted = await userRepo.delete(id);
    if (!deleted) {
      return errorResponse('Gagal menghapus user.', 500);
    }

    return Response.json({ message: 'User berhasil dihapus.' });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
