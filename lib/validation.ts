export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: unknown): password is string {
  if (typeof password !== 'string') return false;
  return password.length >= 6;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidName(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return false;
  if (/<[^>]*>/i.test(trimmed)) return false;
  if (/javascript\s*:/i.test(trimmed)) return false;
  if (/on\w+\s*=/i.test(trimmed)) return false;
  return true;
}

export function isValidRole(role: unknown): role is 'user' | 'admin' | 'consultant' {
  return role === 'user' || role === 'admin' || role === 'consultant';
}

export function isValidConsultationStatus(
  status: unknown
): status is 'new' | 'in_progress' | 'done' {
  return status === 'new' || status === 'in_progress' || status === 'done';
}

export function sanitize(str: string): string {
  return str
    .replace(/<[^>]*>?/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim();
}

export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
