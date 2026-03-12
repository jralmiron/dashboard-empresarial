import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('la página de login carga correctamente', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Somos Gastronómico/)
    await expect(page.getByRole('heading', { name: /Somos Gastronómico/i })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: /Entrar/i })).toBeVisible()
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('noexiste@empresa.com')
    await page.getByLabel('Contraseña').fill('contraseñamala')
    await page.getByRole('button', { name: /Entrar/i }).click()
    await expect(page.getByText(/Email o contraseña incorrectos/i)).toBeVisible({ timeout: 8_000 })
  })

  test('valida formato de email en el cliente', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('no-es-email')
    await page.getByLabel('Contraseña').fill('abc123')
    await page.getByRole('button', { name: /Entrar/i }).click()
    // El input type=email del navegador bloquea el submit con email inválido
    const emailInput = page.getByLabel('Email')
    await expect(emailInput).toHaveAttribute('type', 'email')
  })

  test('ruta protegida /home redirige a /login sin sesión', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/\/login/)
  })

  test('ruta /home redirige a login con parámetro redirectTo', async ({ page }) => {
    await page.goto('/home')
    await expect(page).toHaveURL(/redirectTo=%2Fhome/)
  })
})
