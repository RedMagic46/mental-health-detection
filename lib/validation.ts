// ============================================================
// Lightweight input validation (no external deps)
// ============================================================

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

export function isValidRole(role: unknown): role is 'user' | 'admin' {
  return role === 'user' || role === 'admin';
}

export function isValidConsultationStatus(
  status: unknown
): status is 'new' | 'in_progress' | 'done' {
  return status === 'new' || status === 'in_progress' || status === 'done';
}

/** Sanitize string to prevent XSS in stored data */
export function sanitize(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
}

/** Create a JSON error response */
export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}
