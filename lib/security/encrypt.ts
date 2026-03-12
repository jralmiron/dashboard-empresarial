import { createCipheriv, createDecipheriv, randomBytes, createHmac } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // bytes para AES-256
const IV_LENGTH = 16
const TAG_LENGTH = 16

/**
 * Obtiene la clave de cifrado desde la variable de entorno.
 * La clave debe ser un hex de 64 caracteres (32 bytes).
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY debe ser un hex de 64 caracteres (32 bytes)')
  }
  return Buffer.from(key, 'hex')
}

/**
 * Cifra un string con AES-256-GCM.
 * Devuelve: iv:tag:ciphertext (todo en hex, separado por ':')
 * Usar para datos sensibles en BD: tokens OAuth, claves de API de clientes, etc.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/**
 * Descifra un string cifrado con encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getEncryptionKey()
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':')

  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Formato de ciphertext inválido')
  }

  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

/**
 * Genera un HMAC-SHA256 para verificar integridad de datos.
 * Usar para firmar webhooks (Telegram, Stripe, etc.)
 */
export function generateHmac(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('hex')
}

/**
 * Verifica un HMAC de forma segura (timing-safe).
 */
export function verifyHmac(data: string, secret: string, receivedHmac: string): boolean {
  const expectedHmac = generateHmac(data, secret)
  // Comparación en tiempo constante para evitar timing attacks
  if (expectedHmac.length !== receivedHmac.length) return false
  let mismatch = 0
  for (let i = 0; i < expectedHmac.length; i++) {
    mismatch |= expectedHmac.charCodeAt(i) ^ receivedHmac.charCodeAt(i)
  }
  return mismatch === 0
}

/**
 * Genera un token aleatorio seguro (para invitaciones, reset de password, etc.)
 */
export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}
