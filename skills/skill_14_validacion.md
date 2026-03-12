# SKILL 14 — Validación y Formularios
## Zod + React Hook Form

---

## ROL DE ESTE SKILL

Implementar validación tipada en toda la aplicación usando Zod como esquema de contrato y React Hook Form para gestión eficiente de formularios. Este skill aplica a cualquier formulario, API route o server action del proyecto.

---

## STACK

```
Validación:   Zod (esquemas + inferencia de tipos)
Formularios:  React Hook Form + @hookform/resolvers
Integración:  zodResolver para conectar ambos
```

---

## REGLAS

1. **Esquemas Zod centralizados** — Todos los esquemas en `lib/validations/` (ej: `lib/validations/evento.ts`)
2. **Un esquema = un contrato** — El mismo esquema valida el formulario, la API route y el tipo TypeScript
3. **Nunca validar manualmente** — No usar `if (!value)` cuando Zod puede hacerlo
4. **Mensajes en español** — Todos los mensajes de error en español
5. **Server-side también** — Validar con Zod en API routes/server actions, no solo en frontend

---

## ESTRUCTURA DE ARCHIVOS

```
lib/
└── validations/
    ├── auth.ts          (login, register)
    ├── evento.ts        (crear/editar evento)
    ├── cliente.ts       (CRM)
    ├── presupuesto.ts   (presupuestos/facturas)
    └── common.ts        (tipos reutilizables: fechas, teléfonos, emails)
```

---

## PATRÓN BASE

```typescript
// lib/validations/evento.ts
import { z } from 'zod'

export const eventoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  fecha: z.date({ required_error: 'La fecha es obligatoria' }),
  lugar: z.string().min(2, 'El lugar es obligatorio'),
  capacidad: z.number().int().positive('La capacidad debe ser positiva').optional(),
  estado: z.enum(['borrador', 'confirmado', 'cancelado']).default('borrador'),
})

export type EventoFormData = z.infer<typeof eventoSchema>
```

```typescript
// components/modules/eventos/EventoForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventoSchema, type EventoFormData } from '@/lib/validations/evento'

export function EventoForm() {
  const form = useForm<EventoFormData>({
    resolver: zodResolver(eventoSchema),
    defaultValues: { estado: 'borrador' },
  })

  const onSubmit = async (data: EventoFormData) => {
    // data está completamente tipado y validado
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* usar shadcn/ui Form components */}
    </form>
  )
}
```

---

## INTEGRACIÓN CON SHADCN/UI FORM

Usar siempre los componentes `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` de shadcn/ui para consistencia visual y accesibilidad.

---

## VALIDACIÓN EN API ROUTES

```typescript
// app/api/eventos/route.ts
import { eventoSchema } from '@/lib/validations/evento'

export async function POST(request: Request) {
  const body = await request.json()
  const result = eventoSchema.safeParse(body)

  if (!result.success) {
    return Response.json({ errors: result.error.flatten() }, { status: 400 })
  }

  // result.data está tipado y seguro
}
```

---

## DEPENDENCIAS

```bash
npm install zod react-hook-form @hookform/resolvers
```

---

## OUTPUT ESPERADO

`[SKILL_14_VALIDACION] ✓ tarea completada`
