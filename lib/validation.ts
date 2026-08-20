/**
 * Pure validation utility functions and rules.
 * Separates validation logic from UI components and I/O.
 */

// Email regex ensuring valid user@domain.tld format
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates whether an email string matches standard email formatting.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

export interface PasswordRuleDefinition {
  id: "minLength" | "uppercase" | "number" | "special";
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRuleDefinition[] = [
  { id: "minLength", test: (p: string) => p.length >= 8 },
  { id: "uppercase", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", test: (p: string) => /\d/.test(p) },
  { id: "special", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

/**
 * Validates if a password satisfies all password strength rules.
 */
export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
