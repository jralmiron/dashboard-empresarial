# SKILL — Frontend Moderno
## Transversal | Next.js 14 + TypeScript + Tailwind + shadcn/ui

---

## ARQUITECTURA NEXT.JS 14 (APP ROUTER)

### Server vs Client Components
```typescript
// ✅ Por defecto: Server Component (más rápido, SEO, acceso DB directo)
// app/eventos/page.tsx
export default async function EventosPage() {
  const eventos = await fetchEventos() // Directo, sin API call
  return <EventoList eventos={eventos} />
}

// ✅ Client Component: solo cuando necesitas interactividad
'use client'
// Usar para: useState, useEffect, event handlers, browser APIs
export function EventoCard({ evento }: Props) {
  const [expanded, setExpanded] = useState(false)
  return <div onClick={() => setExpanded(!expanded)}>...</div>
}
```

### Estructura de Rutas
```
app/
  (auth)/           # Route group: no afecta la URL
    login/page.tsx
  (dashboard)/
    layout.tsx      # Layout con sidebar + navbar
    home/page.tsx
    eventos/
      page.tsx      # /eventos
      [id]/page.tsx # /eventos/123
      nuevo/page.tsx
  api/
    eventos/route.ts
```

### Loading y Error States
```typescript
// app/eventos/loading.tsx — Se muestra automáticamente con Suspense
export default function Loading() {
  return <EventoListSkeleton />
}

// app/eventos/error.tsx — Captura errores del servidor
'use client'
export default function Error({ error, reset }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  )
}
```

## COMPONENTES CON SHADCN/UI

```typescript
// ✅ Instalar componentes uno a uno
// npx shadcn@latest add button card dialog table form

// ✅ Extender componentes shadcn, no modificarlos directamente
// components/ui/data-table.tsx — wrapper sobre Table de shadcn

// ✅ Usar variantes de cn() para clases condicionales
import { cn } from '@/lib/utils'

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/10",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

## TAILWIND CSS — BUENAS PRÁCTICAS

```typescript
// ✅ Usar design tokens del theme, no colores hardcodeados
<p className="text-foreground">          // ✅
<p className="text-gray-900">            // ❌ No escala con dark mode

// ✅ Responsive mobile-first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ✅ Agrupar clases por categoría (layout, visual, interactivo)
<button className={cn(
  // Layout
  "flex items-center gap-2 px-4 py-2",
  // Visual
  "bg-primary text-primary-foreground rounded-md",
  // Interactivo
  "hover:bg-primary/90 transition-colors",
  "focus-visible:outline-none focus-visible:ring-2",
  "disabled:opacity-50 disabled:cursor-not-allowed"
)}>
```

## PERFORMANCE

```typescript
// ✅ Next.js Image para imágenes (lazy, optimización automática)
import Image from 'next/image'
<Image src={url} alt={alt} width={400} height={300} />

// ✅ Dynamic imports para componentes pesados
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false  // Solo si usa browser APIs
})

// ✅ Suspense para data fetching
<Suspense fallback={<TableSkeleton />}>
  <DataTable />
</Suspense>

// ✅ Prefetch en navegación
<Link href="/eventos" prefetch>Ver eventos</Link>
```

## INTERNACIONALIZACIÓN (ES)

```typescript
// Todos los textos de UI en español
// Fechas formateadas con Intl
const fecha = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric', month: 'long', year: 'numeric'
}).format(new Date(evento.fecha))
// → "15 de marzo de 2026"

// Números/moneda
const importe = new Intl.NumberFormat('es-ES', {
  style: 'currency', currency: 'EUR'
}).format(1250)
// → "1.250,00 €"
```

## DARK MODE

```typescript
// ✅ Usar next-themes
// Todos los colores con variables CSS (automático con shadcn)
// Probar SIEMPRE en dark y light mode antes de entregar

// Clases que funcionan en ambos modos:
"bg-background text-foreground"
"bg-card text-card-foreground"
"bg-muted text-muted-foreground"
"border-border"
```

## SKELETON LOADERS (obligatorio en todo fetch)

```typescript
// ✅ Cada componente con datos tiene su Skeleton
function EventoCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  )
}
```

## CHECKLIST FRONTEND

- [ ] Server Components por defecto, Client solo si necesario
- [ ] loading.tsx y error.tsx en cada ruta
- [ ] Skeleton loaders en todos los fetches
- [ ] Responsive: móvil, tablet, escritorio
- [ ] Dark/Light mode probado
- [ ] Imágenes con next/image
- [ ] Imports dinámicos para librerías > 50KB
- [ ] Textos y fechas en español/ES
- [ ] Accesibilidad: aria-labels en iconos, roles correctos
