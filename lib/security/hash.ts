import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Genera un hash bcrypt de una cadena (password, token, etc.)
 * Usar en server-side ÚNICAMENTE.
 */
export async function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS)
}

/**
 * Compara una cadena en texto plano con su hash bcrypt.
 * Devuelve true si coinciden.
 */
export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash)
}

/**
 * Genera un hash rápido para tokens de API, invitaciones, etc.
 * (Menor coste que SALT_ROUNDS=12 — no usar para passwords)
 */
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 8)
}

export async function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash)
}
