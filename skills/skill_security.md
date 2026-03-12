# SKILL — Seguridad
## Transversal | Obligatorio en endpoints, auth y formularios

---

## REGLAS DE ORO

1. **Nunca confiar en el cliente** — Validar SIEMPRE en el servidor
2. **Principio de mínimo privilegio** — Solo acceso a lo necesario
3. **Secrets nunca en el cliente** — Solo `NEXT_PUBLIC_` si es seguro exponer
4. **RLS en Supabase** — Toda tabla con Row Level Security activo

## AUTENTICACIÓN Y AUTORIZACIÓN

```typescript
// ✅ Verificar sesión en CADA API route
export async function GET(req: Request) {
  const supabase = createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // Verificar rol si es ruta admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (profile?.rol !== 'admin') {
    return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
  }
}

// ❌ NUNCA asumir que el usuario es quien dice ser
// ❌ NUNCA confiar en el rol enviado desde el frontend
```

## VARIABLES DE ENTORNO

```env
# ✅ Correcto: service role NUNCA con NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=xxx    # Solo servidor

# ✅ Solo públicas las que el cliente necesita
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# ❌ NUNCA exponer
# NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=xxx  ← PELIGRO
# NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=xxx        ← PELIGRO
```

## VALIDACIÓN DE INPUTS

```typescript
// ✅ Validar con Zod en el servidor
import { z } from 'zod'

const createEventoSchema = z.object({
  nombre: z.string().min(1).max(200).trim(),
  fecha: z.string().datetime(),
  importe: z.number().positive().max(999999),
  cliente_id: z.string().uuid()
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = createEventoSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json({ error: result.error.issues }, { status: 400 })
  }
  // Usar result.data (sanitizado y validado)
}
```

## PREVENCIÓN SQL INJECTION
```typescript
// ✅ Usar siempre el cliente de Supabase (queries parametrizadas automáticas)
const { data } = await supabase
  .from('eventos')
  .select('*')
  .eq('id', userId)  // Parametrizado automáticamente

// ❌ NUNCA construir SQL manualmente con interpolación
// const query = `SELECT * FROM eventos WHERE id = '${userId}'` ← PELIGRO
```

## PREVENCIÓN XSS

```typescript
// ✅ React escapa automáticamente en JSX
<p>{userContent}</p>  // Seguro

// ❌ dangerouslySetInnerHTML sin sanitizar
<div dangerouslySetInnerHTML={{ __html: userContent }} />  // PELIGRO

// ✅ Si necesitas HTML, usar DOMPurify
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

## RATE LIMITING EN API

```typescript
// ✅ Implementar rate limiting en rutas sensibles
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

// Aplicar en: /api/auth/*, /api/email/send, /api/telegram/*
```

## UPLOAD DE ARCHIVOS (OCR/Fotos)

```typescript
// ✅ Validar tipo y tamaño en el servidor
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Tipo de archivo no permitido')
}
if (file.size > MAX_SIZE) {
  throw new Error('Archivo demasiado grande')
}

// ✅ Renombrar archivos con UUID (nunca usar nombre original)
const fileName = `${randomUUID()}.${extension}`
```

## CABECERAS DE SEGURIDAD (next.config.js)

```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
]
```

## CSRF PROTECTION
```typescript
// Next.js App Router con Server Actions es seguro por defecto
// Para API routes: verificar Origin header
export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  if (origin !== process.env.NEXT_PUBLIC_APP_URL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
}
```

## CHECKLIST DE SEGURIDAD

- [ ] RLS activado en TODAS las tablas de Supabase
- [ ] API routes verifican sesión y rol
- [ ] Inputs validados con Zod en servidor
- [ ] Secrets solo en variables sin NEXT_PUBLIC_
- [ ] Archivos subidos: tipo y tamaño validados
- [ ] Sin SQL manual (usar Supabase client siempre)
- [ ] dangerouslySetInnerHTML solo con DOMPurify
- [ ] Rate limiting en endpoints sensibles
- [ ] Cabeceras de seguridad en next.config.js
