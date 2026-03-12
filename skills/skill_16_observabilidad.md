# SKILL 16 — Observabilidad y Analíticas
## Sentry + PostHog

---

## ROL DE ESTE SKILL

Capturar errores reales en producción (Sentry) y medir el uso real de la aplicación (PostHog). Sin estas herramientas el proyecto opera ciego en producción.

---

## STACK

```
Errores:    Sentry (@sentry/nextjs)
Analíticas: PostHog (posthog-js + posthog-node)
```

---

## SENTRY — ERRORES Y EXCEPCIONES

### Instalación y configuración

```bash
npx @sentry/wizard@latest -i nextjs
```

Esto genera automáticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.js` actualizado con `withSentryConfig`

### Variables de entorno

```env
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
NEXT_PUBLIC_SENTRY_DSN=
```

### Captura manual de errores

```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // operación crítica
} catch (error) {
  Sentry.captureException(error, {
    extra: { userId, eventoId },
  })
  throw error
}
```

### Error boundary en App Router

```typescript
// app/error.tsx
'use client'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={reset}>Reintentar</button>
    </div>
  )
}
```

---

## POSTHOG — ANALÍTICAS DE PRODUCTO

### Configuración

```typescript
// app/providers.tsx (añadir al Providers existente)
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    capture_pageview: false, // manual en Next.js
  })
}
```

### Variables de entorno

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Eventos a trackear (mínimo)

```typescript
posthog.capture('evento_creado', { tipo: evento.tipo })
posthog.capture('presupuesto_enviado', { monto: presupuesto.total })
posthog.capture('login_exitoso', { metodo: 'email' })
```

---

## REGLAS

1. **Sentry en todos los entornos menos local** — Usar variable `NEXT_PUBLIC_SENTRY_DSN` solo en staging/prod
2. **No loggear datos sensibles** — Nunca enviar passwords, tokens ni datos personales a Sentry/PostHog
3. **PostHog es opcional en MVP** — Priorizar Sentry; PostHog se activa cuando el producto ya tiene usuarios reales
4. **Source maps en prod** — Configurar Sentry para subir source maps en el build de Vercel

---

## DEPENDENCIAS

```bash
npm install @sentry/nextjs posthog-js
```

---

## OUTPUT ESPERADO

`[SKILL_16_OBSERVABILIDAD] ✓ tarea completada`
