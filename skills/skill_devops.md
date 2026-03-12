# SKILL — DevOps, CI/CD y Despliegue
## Transversal | Configurar desde el inicio del proyecto

---

## REPOSITORIO Y RAMAS

```
main          → producción (Vercel auto-deploy)
develop       → staging (Vercel preview)
feature/*     → nuevas funcionalidades
fix/*         → correcciones de bugs
```

### Commit Convention (Conventional Commits)
```
feat: añadir módulo de contabilidad con OCR
fix: corregir cálculo de IVA en presupuestos
chore: actualizar dependencias
docs: documentar API de eventos
refactor: extraer lógica de balance a hook
test: añadir tests para calcularBalance
```

## GITHUB ACTIONS

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## VARIABLES DE ENTORNO POR ENTORNO

```env
# .env.local (desarrollo - NO commitear)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=local_anon_key
SUPABASE_SERVICE_ROLE_KEY=local_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Producción (configurar en Vercel Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_anon_key
SUPABASE_SERVICE_ROLE_KEY=prod_service_key
NEXT_PUBLIC_APP_URL=https://dashboard.miempresa.com
```

### .gitignore crítico
```gitignore
.env
.env.local
.env.*.local
.vercel
node_modules/
.next/
```

## VERCEL DEPLOYMENT

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["mad1"],
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### Preview Deployments
- Cada PR genera una URL de preview automáticamente
- Usar para QA antes de merge a main
- Variables de entorno separadas para preview

## SUPABASE ENVIRONMENTS

```
Local:       supabase start (Docker local)
Staging:     Branch de Supabase (preview con datos de test)
Producción:  Proyecto principal de Supabase
```

```bash
# Comandos de Supabase CLI
supabase start                          # Iniciar local
supabase db diff -f nueva_migracion     # Generar migración
supabase db push                        # Aplicar migraciones
supabase gen types typescript --local   # Generar tipos TS
```

## MONITOREO EN PRODUCCIÓN

### Errores
- Configurar Sentry para captura de errores en cliente y servidor
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1
})
```

### Logs
- Vercel Logs: errores de runtime y build
- Supabase Logs: queries lentas y errores de DB

### Alertas
- Alerta si tiempo de respuesta API > 3s
- Alerta si tasa de errores 5xx > 1%
- Alerta si uso de DB > 80%

## PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "db:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "db:push": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

## CHECKLIST DEVOPS

- [ ] .gitignore con .env y .next excluidos
- [ ] GitHub Actions con lint, typecheck y tests
- [ ] Variables de entorno en Vercel configuradas
- [ ] Supabase migraciones versionadas
- [ ] Sentry configurado para producción
- [ ] vercel.json con región europea
- [ ] Conventional commits en el equipo
- [ ] Preview deployments para cada PR
