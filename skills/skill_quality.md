# SKILL — Calidad de Código y Buenas Prácticas
## Transversal | Aplicar en TODO el código generado

---

## PRINCIPIOS FUNDAMENTALES

### Clean Code
- Nombres descriptivos y en inglés para código, español para UI/comentarios
- Funciones con una sola responsabilidad (max 20 líneas)
- No comentar lo obvio — comentar el "por qué", no el "qué"
- Eliminar código muerto y console.logs antes de commit
- DRY: extraer lógica repetida a funciones/hooks reutilizables

### TypeScript
```typescript
// ✅ Correcto: tipos explícitos, no any
interface Evento {
  id: string
  nombre: string
  fecha: Date
  estado: 'pendiente' | 'confirmado' | 'finalizado'
}

// ❌ Incorrecto
const evento: any = { ... }
```

### Estructura de Archivos
```
components/
  EventoCard/
    index.tsx          // Export principal
    EventoCard.tsx     // Componente
    EventoCard.test.tsx
    types.ts           // Tipos del componente
```

### Imports
```typescript
// Orden: 1. Node/React, 2. Librerías externas, 3. Aliases internos, 4. Relativos
import React from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

import { EventoCard } from './EventoCard'
```

## CONVENCIONES NOMBRADO

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes React | PascalCase | `EventoCard` |
| Funciones/variables | camelCase | `fetchEventos` |
| Constantes globales | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Archivos componente | PascalCase | `EventoCard.tsx` |
| Archivos utilidad | kebab-case | `format-date.ts` |
| Tablas DB | snake_case | `evento_proveedores` |
| Variables CSS/Tailwind | kebab-case | `bg-primary-500` |

## MANEJO DE ERRORES

```typescript
// ✅ Siempre manejar errores en llamadas async
async function fetchEvento(id: string) {
  try {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching evento:', error)
    throw new Error(`No se pudo cargar el evento: ${id}`)
  }
}

// ✅ Error boundaries en React para componentes críticos
// ✅ Toast de error visible al usuario siempre
```

## ESTADO Y DATOS

```typescript
// ✅ React Query para server state
const { data: eventos, isLoading, error } = useQuery({
  queryKey: ['eventos'],
  queryFn: fetchEventos,
  staleTime: 5 * 60 * 1000 // 5 minutos
})

// ✅ Zustand para UI state global (no usar Context para estado complejo)
// ✅ useState solo para estado local simple
// ❌ No mezclar server state con client state
```

## FORMULARIOS

```typescript
// ✅ React Hook Form + Zod para validación
const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  email: z.string().email('Email no válido'),
  importe: z.number().positive('Debe ser mayor a 0')
})

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema)
})
```

## OPTIMIZACIÓN DE RENDERS

```typescript
// ✅ Memoizar componentes costosos
const EventoList = React.memo(({ eventos }: Props) => { ... })

// ✅ useMemo para cálculos costosos
const totalBalance = useMemo(() =>
  movimientos.reduce((acc, m) => acc + m.importe, 0),
  [movimientos]
)

// ✅ useCallback para funciones que se pasan como props
const handleDelete = useCallback((id: string) => {
  deleteEvento(id)
}, [deleteEvento])
```

## CHECKLIST ANTES DE ENTREGAR CÓDIGO

- [ ] Sin `any` en TypeScript
- [ ] Sin `console.log` sin eliminar
- [ ] Errores manejados con try/catch
- [ ] Loading states implementados
- [ ] Empty states implementados
- [ ] Responsive en móvil verificado
- [ ] Variables de entorno no hardcodeadas
- [ ] Queries optimizadas (sin N+1)
- [ ] Componentes < 150 líneas (si no, dividir)
