# SKILL 15 — Estado Servidor y Tablas
## TanStack Query + TanStack Table

---

## ROL DE ESTE SKILL

Gestionar el estado del servidor (fetching, caché, sincronización) con TanStack Query y renderizar listados complejos con filtros, ordenación y paginación usando TanStack Table.

---

## STACK

```
Estado servidor:  TanStack Query v5 (@tanstack/react-query)
Tablas:           TanStack Table v8 (@tanstack/react-table)
DevTools:         @tanstack/react-query-devtools (solo dev)
```

---

## REGLAS

1. **No useState para datos remotos** — Todo fetch de datos va por TanStack Query
2. **Invalidar tras mutación** — Siempre `queryClient.invalidateQueries` después de crear/editar/borrar
3. **Query keys consistentes** — Usar arrays estructurados: `['eventos', { estado: 'confirmado' }]`
4. **Paginación server-side** — Para listas grandes, paginar en la query, no cargar todo
5. **TanStack Table para cualquier lista con >3 columnas** — No construir tablas manualmente

---

## CONFIGURACIÓN GLOBAL

```typescript
// app/providers.tsx
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minuto
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## PATRÓN QUERY

```typescript
// lib/queries/eventos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const eventosKeys = {
  all: ['eventos'] as const,
  list: (filters: Record<string, unknown>) => ['eventos', 'list', filters] as const,
  detail: (id: string) => ['eventos', 'detail', id] as const,
}

export function useEventos(filters = {}) {
  return useQuery({
    queryKey: eventosKeys.list(filters),
    queryFn: () => fetch('/api/eventos').then(r => r.json()),
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EventoFormData) =>
      fetch('/api/eventos', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventosKeys.all })
    },
  })
}
```

---

## PATRÓN TABLA

```typescript
// components/modules/eventos/EventosTable.tsx
'use client'
import { useReactTable, getCoreRowModel, getSortedRowModel,
         getFilteredRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table'

export function EventosTable({ data }: { data: Evento[] }) {
  const columns = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'fecha', header: 'Fecha' },
    { accessorKey: 'estado', header: 'Estado' },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // Renderizar con shadcn/ui Table components
}
```

---

## ESTRUCTURA DE ARCHIVOS

```
lib/
└── queries/
    ├── eventos.ts
    ├── clientes.ts
    ├── presupuestos.ts
    └── tareas.ts
```

---

## DEPENDENCIAS

```bash
npm install @tanstack/react-query @tanstack/react-table @tanstack/react-query-devtools
```

---

## OUTPUT ESPERADO

`[SKILL_15_TANSTACK] ✓ tarea completada`
