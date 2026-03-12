# SKILL — Diseño de APIs
## Transversal | Toda API route del proyecto

---

## CONVENCIONES REST

### Estructura de URLs
```
GET    /api/eventos              → listar eventos
POST   /api/eventos              → crear evento
GET    /api/eventos/[id]         → obtener evento
PUT    /api/eventos/[id]         → actualizar evento completo
PATCH  /api/eventos/[id]         → actualizar campos parciales
DELETE /api/eventos/[id]         → eliminar evento

GET    /api/eventos/[id]/tareas  → tareas de un evento
POST   /api/eventos/[id]/tareas  → crear tarea en evento
```

### Códigos de respuesta
```
200 OK              → GET exitoso
201 Created         → POST exitoso (con el recurso creado)
204 No Content      → DELETE exitoso
400 Bad Request     → Validación fallida
401 Unauthorized    → Sin autenticación
403 Forbidden       → Sin permisos (autenticado pero no autorizado)
404 Not Found       → Recurso no existe
409 Conflict        → Duplicado (ej: email ya registrado)
422 Unprocessable   → Datos semánticamente incorrectos
500 Internal Server → Error del servidor
```

## ESTRUCTURA DE API ROUTE

```typescript
// app/api/eventos/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const createEventoSchema = z.object({
  nombre: z.string().min(1).max(200),
  fecha_evento: z.string().datetime(),
  tipo: z.enum(['boda', 'corporativo', 'cumpleaños', 'congreso', 'otro']),
  cliente_id: z.string().uuid().optional()
})

export async function GET(req: Request) {
  try {
    // 1. Autenticación
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // 2. Query params
    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado')
    const page = parseInt(searchParams.get('page') ?? '0')

    // 3. Query
    let query = supabase.from('eventos').select('*', { count: 'exact' })
    if (estado) query = query.eq('estado', estado)
    const { data, error, count } = await query
      .range(page * 20, (page + 1) * 20 - 1)
      .order('fecha_evento', { ascending: true })

    if (error) throw error

    // 4. Respuesta con paginación
    return NextResponse.json({
      data,
      total: count,
      page,
      pageSize: 20
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Validar body
    const body = await req.json()
    const result = createEventoSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('eventos')
      .insert({ ...result.data, created_by: user.id })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

## FORMATO DE RESPUESTA ESTÁNDAR

```typescript
// ✅ Listados con paginación
{
  "data": [...],
  "total": 150,
  "page": 0,
  "pageSize": 20
}

// ✅ Recurso único
{
  "id": "uuid",
  "nombre": "...",
  ...
}

// ✅ Error
{
  "error": "Descripción del error",
  "details": [...] // Opcional: detalles de validación
}
```

## MIDDLEWARE DE AUTH REUTILIZABLE

```typescript
// lib/api/withAuth.ts
export function withAuth(
  handler: (req: Request, user: User, profile: Profile) => Promise<Response>,
  options?: { requireAdmin?: boolean }
) {
  return async (req: Request) => {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (options?.requireAdmin) {
      const { data: profile } = await supabase
        .from('profiles').select('rol').eq('id', user.id).single()

      if (profile?.rol !== 'admin') {
        return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
      }
    }

    return handler(req, user, profile)
  }
}

// Uso:
export const GET = withAuth(async (req, user) => {
  // user garantizado aquí
}, { requireAdmin: true })
```

## CHECKLIST DE APIS

- [ ] Autenticación verificada en cada route
- [ ] Validación con Zod en POST/PUT/PATCH
- [ ] Códigos HTTP correctos (201 para POST, 204 para DELETE)
- [ ] Paginación en todos los listados
- [ ] Manejo de errores con try/catch
- [ ] Formato de respuesta consistente
- [ ] Query params tipados y validados
- [ ] Rate limiting en rutas sensibles
