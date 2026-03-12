# SKILL — Rendimiento y Optimización
## Transversal | Verificar antes de deploy

---

## OBJETIVOS DE RENDIMIENTO

| Métrica | Objetivo |
|---|---|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP (Interactividad) | < 100ms |
| CLS (Layout Shift) | < 0.1 |
| Time to First Byte | < 800ms |
| Dashboard load (data) | < 2s |

## NEXT.JS OPTIMIZACIONES

### Caching y Revalidación
```typescript
// ✅ Cache agresivo para datos que no cambian frecuentemente
const eventos = await fetch('/api/eventos', {
  next: { revalidate: 60 }  // Revalidar cada 60 segundos
})

// ✅ Revalidar on-demand tras mutaciones
import { revalidatePath, revalidateTag } from 'next/cache'

// Tras crear un evento:
revalidatePath('/eventos')
revalidateTag('eventos')
```

### Parallel Data Fetching
```typescript
// ✅ Fetch en paralelo (no en cascada)
export default async function DashboardPage() {
  const [eventos, tareas, balance] = await Promise.all([
    fetchProximosEventos(),
    fetchTareasPendientes(),
    fetchBalanceMes()
  ])
}

// ❌ En cascada (lento)
const eventos = await fetchEventos()
const tareas = await fetchTareas()  // Espera a eventos innecesariamente
```

## DATABASE OPTIMIZACIONES

### Índices en Supabase
```sql
-- Índices esenciales
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_eventos_estado ON eventos(estado);
CREATE INDEX idx_tareas_asignado ON tareas(asignado_a);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha);
CREATE INDEX idx_movimientos_evento ON movimientos(evento_id);
```

### Select solo columnas necesarias
```typescript
// ✅ Solo los campos que necesitas
const { data } = await supabase
  .from('eventos')
  .select('id, nombre, fecha_evento, estado, cliente_id')

// ❌ Select * en tablas grandes
const { data } = await supabase.from('eventos').select('*')
```

### Paginación obligatoria en listados
```typescript
// ✅ Siempre paginar listas grandes
const PAGE_SIZE = 20

const { data, count } = await supabase
  .from('eventos')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('fecha_evento', { ascending: false })
```

## BUNDLE OPTIMIZATION

```typescript
// ✅ Analizar bundle
// npx @next/bundle-analyzer

// ✅ Dynamic imports para librerías pesadas
const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false })
const Chart = dynamic(() => import('./BalanceChart'), { loading: () => <Skeleton /> })

// ✅ Tree shaking: importar solo lo que usas
import { format } from 'date-fns/format'       // ✅
import * as dateFns from 'date-fns'             // ❌ Todo el bundle
```

## IMÁGENES

```typescript
// ✅ Next.js Image con dimensiones explícitas
<Image
  src={avatarUrl}
  alt={nombre}
  width={40}
  height={40}
  className="rounded-full"
  loading="lazy"  // Por defecto en Next.js Image
/>

// ✅ Imágenes en Supabase Storage con transformaciones
const avatarUrl = supabase.storage
  .from('avatars')
  .getPublicUrl(path, {
    transform: { width: 80, height: 80, resize: 'cover' }
  })
```

## REACT QUERY CACHING

```typescript
// ✅ Configuración global óptima
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min sin refetch
      gcTime: 10 * 60 * 1000,      // 10 min en cache
      retry: 1,
      refetchOnWindowFocus: false,
    }
  }
})

// ✅ Prefetch en hover para navegación instantánea
<Link
  href={`/eventos/${id}`}
  onMouseEnter={() => queryClient.prefetchQuery(['evento', id], fetchEvento)}
>
```

## SUPABASE REALTIME (optimizado)

```typescript
// ✅ Subscribe solo a cambios necesarios, no toda la tabla
const subscription = supabase
  .channel('mis-tareas')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'tareas',
    filter: `asignado_a=eq.${userId}`  // Solo mis tareas
  }, handleUpdate)
  .subscribe()

// ✅ Limpiar subscripciones al desmontar
useEffect(() => {
  return () => { subscription.unsubscribe() }
}, [])
```

## CHECKLIST DE PERFORMANCE

- [ ] Parallel data fetching en dashboards
- [ ] Paginación en todas las listas
- [ ] Select solo columnas necesarias en queries
- [ ] Índices en columnas de filtro frecuente
- [ ] Dynamic imports para componentes > 50KB
- [ ] next/image en todas las imágenes
- [ ] React Query con staleTime configurado
- [ ] Realtime subscriptions con filtros específicos
- [ ] Limpieza de subscripciones en useEffect
