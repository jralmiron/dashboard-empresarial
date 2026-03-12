# SKILL 17 — Gráficos y Fechas
## Recharts + date-fns

---

## ROL DE ESTE SKILL

Renderizar KPIs, series temporales y gráficos del dashboard usando Recharts, y gestionar fechas, rangos y zonas horarias con date-fns. Aplica al panel home, contabilidad, eventos y cualquier vista con datos visuales.

---

## STACK

```
Gráficos:  Recharts (recharts)
Fechas:    date-fns + date-fns-tz (zonas horarias)
```

---

## RECHARTS — GRÁFICOS

### Reglas de uso

1. **Recharts por defecto** — No usar Chart.js ni otras librerías salvo necesidad específica
2. **Responsive siempre** — Envolver todo en `<ResponsiveContainer width="100%" height={300}>`
3. **Colores del sistema** — Usar los colores de Tailwind/shadcn, no valores hardcodeados
4. **Loading states** — Mostrar skeleton mientras cargan los datos (nunca gráfico vacío)

### Tipos de gráfico por caso de uso

| Caso | Componente Recharts |
|---|---|
| Ingresos por mes | `<AreaChart>` o `<BarChart>` |
| Comparativa estados eventos | `<BarChart>` agrupado |
| Distribución por tipo | `<PieChart>` |
| KPI tendencia | `<LineChart>` |

### Patrón base

```typescript
// components/modules/dashboard/IngresosMensuales.tsx
'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: { mes: string; ingresos: number }[]
}

export function IngresosMensuales({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="mes" />
        <YAxis tickFormatter={(v) => `€${v.toLocaleString()}`} />
        <Tooltip formatter={(v: number) => [`€${v.toLocaleString()}`, 'Ingresos']} />
        <Area
          type="monotone"
          dataKey="ingresos"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary) / 0.1)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
```

---

## DATE-FNS — GESTIÓN DE FECHAS

### Reglas

1. **Nunca `new Date()` para formatear** — Siempre date-fns
2. **Locale español** — Importar `es` de `date-fns/locale` para nombres de meses/días
3. **Zonas horarias** — Usar `date-fns-tz` para conversiones entre UTC (BD) y local

### Funciones de uso frecuente

```typescript
import { format, parseISO, startOfMonth, endOfMonth,
         isWithinInterval, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

// Formatear fecha para mostrar
format(fecha, "d 'de' MMMM yyyy", { locale: es })  // "12 de marzo 2026"

// Formatear para inputs
format(fecha, 'yyyy-MM-dd')  // "2026-03-12"

// Rango del mes actual
const inicio = startOfMonth(new Date())
const fin = endOfMonth(new Date())

// Días hasta el evento
const diasRestantes = differenceInDays(eventoFecha, new Date())

// Parsear desde BD (siempre string ISO)
const fecha = parseISO(row.created_at)
```

### Utilidades centralizadas

```typescript
// lib/utils/dates.ts
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export const formatFecha = (date: Date | string) =>
  format(typeof date === 'string' ? parseISO(date) : date, "d 'de' MMMM yyyy", { locale: es })

export const formatFechaCorta = (date: Date | string) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'dd/MM/yyyy')

export const formatHora = (date: Date | string) =>
  format(typeof date === 'string' ? parseISO(date) : date, 'HH:mm')
```

---

## DEPENDENCIAS

```bash
npm install recharts date-fns date-fns-tz
```

---

## OUTPUT ESPERADO

`[SKILL_17_GRAFICOS] ✓ tarea completada`
