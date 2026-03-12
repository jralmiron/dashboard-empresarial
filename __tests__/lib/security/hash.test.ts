import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, hashToken } from '@/lib/security/hash'

describe('hashPassword / verifyPassword', () => {
  it('hashea una contraseña y la verifica correctamente', async () => {
    const password = 'miContraseñaSegura123'
    const hash = await hashPassword(password)

    expect(hash).not.toBe(password)
    expect(hash).toMatch(/^\$2[ab]\$/)
    await expect(verifyPassword(password, hash)).resolves.toBe(true)
  })

  it('rechaza contraseña incorrecta', async () => {
    const hash = await hashPassword('correcta')
    await expect(verifyPassword('incorrecta', hash)).resolves.toBe(false)
  })

  it('produce hashes distintos para la misma contraseña (salt)', async () => {
    const h1 = await hashPassword('abc123')
    const h2 = await hashPassword('abc123')
    expect(h1).not.toBe(h2)
  })
})

describe('hashToken', () => {
  it('produce un hash bcrypt con coste reducido (8 rounds)', async () => {
    const hash = await hashToken('token-reset-abc123')
    expect(hash).toMatch(/^\$2[ab]\$08\$/)
  })

  it('el hash es diferente al token original', async () => {
    const hash = await hashToken('mi-token')
    expect(hash).not.toBe('mi-token')
  })

  it('dos hashes del mismo token son distintos (salt aleatorio)', async () => {
    const h1 = await hashToken('mismo-token')
    const h2 = await hashToken('mismo-token')
    expect(h1).not.toBe(h2)
  })
})
