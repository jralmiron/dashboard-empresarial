import { describe, it, expect, beforeAll } from 'vitest'
import { encrypt, decrypt, generateHmac, verifyHmac, generateSecureToken } from '@/lib/security/encrypt'

// Clave de test: 64 chars hex (32 bytes AES-256)
const TEST_KEY = 'a'.repeat(64)

beforeAll(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY
})

describe('encrypt / decrypt', () => {
  it('cifra y descifra correctamente', () => {
    const original = 'texto-secreto-123'
    const ciphertext = encrypt(original)
    expect(decrypt(ciphertext)).toBe(original)
  })

  it('produce ciphertexts distintos para el mismo input (IV aleatorio)', () => {
    const c1 = encrypt('mismo texto')
    const c2 = encrypt('mismo texto')
    expect(c1).not.toBe(c2)
  })

  it('el ciphertext tiene el formato iv:tag:data', () => {
    const parts = encrypt('test').split(':')
    expect(parts).toHaveLength(3)
    parts.forEach(p => expect(p.length).toBeGreaterThan(0))
  })

  it('lanza error con formato inválido', () => {
    expect(() => decrypt('formato-invalido')).toThrow()
  })
})

describe('generateHmac / verifyHmac', () => {
  it('genera un HMAC válido y lo verifica', () => {
    const hmac = generateHmac('payload', 'secreto')
    expect(verifyHmac('payload', 'secreto', hmac)).toBe(true)
  })

  it('rechaza HMAC con payload distinto', () => {
    const hmac = generateHmac('payload-a', 'secreto')
    expect(verifyHmac('payload-b', 'secreto', hmac)).toBe(false)
  })

  it('rechaza HMAC con secreto distinto', () => {
    const hmac = generateHmac('payload', 'secreto-a')
    expect(verifyHmac('payload', 'secreto-b', hmac)).toBe(false)
  })
})

describe('generateSecureToken', () => {
  it('genera un token hex de la longitud correcta (32 bytes = 64 chars)', () => {
    const token = generateSecureToken()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[a-f0-9]+$/)
  })

  it('acepta tamaño personalizado', () => {
    expect(generateSecureToken(16)).toHaveLength(32)
  })

  it('genera tokens únicos', () => {
    expect(generateSecureToken()).not.toBe(generateSecureToken())
  })
})
