import { describe, it, expect } from 'vitest'
import { loginSchema } from '@/lib/validations/auth'

describe('loginSchema', () => {
  it('acepta credenciales válidas', () => {
    const result = loginSchema.safeParse({
      email: 'admin@empresa.com',
      password: 'secreto123',
    })
    expect(result.success).toBe(true)
  })

  it('rechaza email inválido', () => {
    const result = loginSchema.safeParse({ email: 'no-es-email', password: 'abc123' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Introduce un email válido')
  })

  it('rechaza email vacío', () => {
    const result = loginSchema.safeParse({ email: '', password: 'abc123' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('El email es obligatorio')
  })

  it('rechaza contraseña menor de 6 caracteres', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '12345' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/6 caracteres/)
  })

  it('rechaza contraseña vacía', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '' })
    expect(result.success).toBe(false)
  })
})
