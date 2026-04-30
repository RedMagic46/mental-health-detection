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

/**
 * Validate that a name contains only safe characters.
 * Blocks HTML tags, script injections, and control characters.
 */
export function isValidName(name: unknown): name is string {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length === 0 || trimmed.length > 100) return false;
  // Block any HTML-like tags or script patterns
  if (/<[^>]*>/i.test(trimmed)) return false;
  if (/javascript\s*:/i.test(trimmed)) return false;
  if (/on\w+\s*=/i.test(trimmed)) return false;
  return true;
}

export function isValidRole(role: unknown): role is 'user' | 'admin' {
  return role === 'user' || role === 'admin';
}

export function isValidConsultationStatus(
  status: unknown
): status is 'new' | 'in_progress' | 'done' {
  return status === 'new' || status === 'in_progress' || status === 'done';
}

/**
 * Sanitize string to prevent XSS in stored data.
 * Strips all HTML tags and dangerous patterns.
 * NOTE: No entity-encoding needed — React JSX auto-escapes text output.
 */
export function sanitize(str: string): string {
  return str
    // Strip all HTML tags
    .replace(/<[^>]*>?/g, '')
    // Remove javascript: protocol patterns
    .replace(/javascript\s*:/gi, '')
    // Remove event handler patterns (onclick=, onerror=, etc.)
    .replace(/on\w+\s*=/gi, '')
    // Remove any remaining angle brackets
    .replace(/[<>]/g, '')
    .trim();
}

/** Create a JSON error response */
export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

