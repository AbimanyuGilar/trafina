/**
 * Utility sanitization and validation function to defend against prompt injection
 * and illegal input parameters.
 */

export function sanitizePrompt(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Truncate overly long prompts to prevent payload abuse / token exhaustion
  const maxLen = 2000;
  let sanitized = input.trim().slice(0, maxLen);

  // Remove potential dangerous control characters
  sanitized = sanitized.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

  return sanitized;
}

export function validateDateRange(startDate?: string, endDate?: string): { valid: boolean; startDate?: string; endDate?: string } {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  const hasStart = Boolean(startDate);
  const hasEnd = Boolean(endDate);

  const isValidStart = !hasStart || dateRegex.test(startDate!);
  const isValidEnd = !hasEnd || dateRegex.test(endDate!);

  return {
    valid: Boolean(isValidStart && isValidEnd),
    startDate: hasStart && isValidStart ? startDate : undefined,
    endDate: hasEnd && isValidEnd ? endDate : undefined,
  };
}
