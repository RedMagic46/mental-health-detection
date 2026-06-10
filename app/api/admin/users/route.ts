import { requireAdmin, toSafeUser, hashPassword } from '@/lib/auth';
import { userRepo } from '@/lib/db';
import { isValidEmail, isValidPassword, isValidName, isValidRole, sanitize, errorResponse } from '@/lib/validation';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  const users = await userRepo.findAll();
  const safeUsers = users.map(toSafeUser);
  
  return Response.json({ users: safeUsers });
}

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse('Akses ditolak.', 403);
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!isValidName(name)) {
      return errorResponse('Nama tidak valid. Tidak boleh mengandung karakter khusus atau tag HTML.', 400);
    }
    if (!isValidEmail(email)) {
      return errorResponse('Format email tidak valid.', 400);
    }
    if (!isValidPassword(password)) {
      return errorResponse('Password minimal 6 karakter.', 400);
    }
    if (!isValidRole(role)) {
      return errorResponse('Role tidak valid.', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await userRepo.findByEmail(normalizedEmail)) {
      return errorResponse('Email sudah terdaftar.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepo.create({
      name: sanitize(name),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    return Response.json({ 
      user: toSafeUser(user)
    }, { status: 201 });
  } catch {
    return errorResponse('Terjadi kesalahan server.', 500);
  }
}
