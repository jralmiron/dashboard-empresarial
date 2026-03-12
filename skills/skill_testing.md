# SKILL — Testing y Calidad
## Transversal | Cobertura mínima en módulos críticos

---

## ESTRATEGIA DE TESTING

### Pirámide de Tests
```
         E2E Tests (Playwright)
        /     pocos, críticos      \
       /                            \
      Integration Tests (Vitest)
     /     flujos de negocio        \
    /                                \
   Unit Tests (Vitest + Testing Library)
  /     componentes y funciones      \
```

## UNIT TESTS

### Utilidades y lógica de negocio
```typescript
// lib/utils/calculos.test.ts
import { describe, it, expect } from 'vitest'
import { calcularBalance, calcularIVA } from './calculos'

describe('calcularBalance', () => {
  it('retorna la diferencia entre ingresos y gastos', () => {
    const movimientos = [
      { tipo: 'ingreso', importe: 1000 },
      { tipo: 'gasto', importe: 300 },
    ]
    expect(calcularBalance(movimientos)).toBe(700)
  })

  it('retorna 0 si no hay movimientos', () => {
    expect(calcularBalance([])).toBe(0)
  })
})
```

### Componentes React
```typescript
// components/EventoCard.test.tsx
import { render, screen } from '@testing-library/react'
import { EventoCard } from './EventoCard'

const mockEvento = {
  id: '1',
  nombre: 'Boda García',
  estado: 'confirmado',
  fecha: '2026-03-20'
}

describe('EventoCard', () => {
  it('muestra el nombre del evento', () => {
    render(<EventoCard evento={mockEvento} />)
    expect(screen.getByText('Boda García')).toBeInTheDocument()
  })

  it('muestra badge de estado correcto', () => {
    render(<EventoCard evento={mockEvento} />)
    expect(screen.getByText('Confirmado')).toBeInTheDocument()
  })
})
```

## INTEGRATION TESTS

```typescript
// __tests__/api/eventos.test.ts
import { testClient } from '@/lib/test-utils'

describe('POST /api/eventos', () => {
  it('crea un evento con datos válidos', async () => {
    const response = await testClient.post('/api/eventos', {
      nombre: 'Evento test',
      fecha: '2026-06-15',
      tipo: 'corporativo'
    })
    expect(response.status).toBe(201)
    expect(response.body.nombre).toBe('Evento test')
  })

  it('rechaza sin autenticación', async () => {
    const response = await testClient
      .post('/api/eventos', { nombre: 'Test' })
      .withoutAuth()
    expect(response.status).toBe(401)
  })

  it('valida campos requeridos', async () => {
    const response = await testClient.post('/api/eventos', {})
    expect(response.status).toBe(400)
  })
})
```

## E2E TESTS (Playwright)

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('flujo completo de login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'admin@empresa.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('[type="submit"]')
  await expect(page).toHaveURL('/home')
  await expect(page.locator('h1')).toContainText('Dashboard')
})

test('empleado no ve módulo de contabilidad', async ({ page }) => {
  // Login como empleado
  await loginAs(page, 'empleado')
  await expect(page.locator('[href="/contabilidad"]')).not.toBeVisible()
})
```

## MÓDULOS CRÍTICOS A TESTEAR

| Módulo | Prioridad | Qué testear |
|---|---|---|
| Auth | Alta | Login, logout, roles, rutas protegidas |
| Contabilidad | Alta | Cálculos de balance, IVA, totales |
| Presupuestos | Alta | Cálculo de totales, conversión a factura |
| OCR | Media | Parseo de datos extraídos |
| Scrum | Media | Cambio de estado, permisos por rol |
| Email | Baja | Envío, plantillas |

## CONFIGURACIÓN

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 50
      }
    }
  }
})
```

## MOCKS

```typescript
// Mockear Supabase en tests
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: mockData, error: null })
      })
    })
  })
}))
```

## CHECKLIST DE TESTING

- [ ] Utils de cálculo (balance, IVA, totales) con unit tests
- [ ] Componentes críticos con render tests
- [ ] API routes con integration tests (auth + validación)
- [ ] Flujos E2E: login, crear evento, mover tarea kanban
- [ ] Cobertura mínima 60% en módulos críticos
