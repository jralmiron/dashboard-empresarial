# SKILL — Diseño y UI/UX
## Sistema de diseño — Somos Gastronómico

---

## IDENTIDAD DE MARCA

Cliente: **Somos Gastronómico** — https://somosgastronomico.com/
Estilo: Claro, moderno, cálido. Naranja vibrante como color de acción. Marrón tierra como base oscura.

---

## PALETA DE COLORES (usar siempre estos valores)

### Colores de marca
| Token Tailwind | HEX | Uso |
|---|---|---|
| `bg-primary` / `text-primary` | `#fa811e` | Botones CTA, iconos activos, badges, focus rings |
| `bg-primary-hover` (hover) | `#ed7411` | Hover de botones, links hover |
| `bg-brand-light` | `#fef3e8` | Fondos suaves de acento |
| `bg-secondary` / `bg-sidebar` | `#422626` | Sidebar, footer, fondos oscuros |

### Colores de UI (light mode)
| Token | HEX | Uso |
|---|---|---|
| `bg-background` | `#ffffff` | Fondo principal |
| `bg-background-subtle` | `#f7f7f7` | Fondo alternativo, zebra tables |
| `bg-muted` | `#f5f5f5` | Inputs, áreas desactivadas |
| `text-foreground` | `#2a2c2c` | Texto principal |
| `text-muted-foreground` | `#626262` | Texto secundario, labels |
| `text-foreground-subtle` | `#a8a8a8` | Placeholders, hints |
| `text-accent` | `#0089f7` | Links, badges info |
| `border-border` | `#e5e5e5` | Bordes de cards, separadores |

### Sidebar
| Token | Valor | Uso |
|---|---|---|
| `bg-sidebar` | `#422626` (marrón tierra) | Fondo sidebar |
| `text-sidebar-foreground` | `#f2f2f2` | Texto en sidebar |
| `text-sidebar-accent` | `#fa811e` | Item activo en sidebar |

---

## TIPOGRAFÍA

```
Font: Alata (Google Fonts) — sans-serif limpia y moderna
Fallback: Inter, sans-serif

Cargar en app/layout.tsx:
import { Alata } from 'next/font/google'
const alata = Alata({ weight: '400', subsets: ['latin'] })
```

| Uso | Clase Tailwind |
|---|---|
| Título de página | `text-2xl font-semibold text-foreground` |
| Subtítulo sección | `text-lg font-medium text-foreground` |
| Cuerpo | `text-sm text-foreground` |
| Label | `text-xs font-medium text-muted-foreground` |
| Hint / placeholder | `text-xs text-muted-foreground` |

---

## COMPONENTES — GUÍA RÁPIDA

### Botón primario (naranja de marca)
```tsx
<Button className="bg-primary hover:bg-primary-hover text-white">
  Crear evento
</Button>
```

### Botón secundario
```tsx
<Button variant="outline" className="border-border hover:border-primary hover:text-primary">
  Cancelar
</Button>
```

### Card estándar
```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm">
  {/* contenido */}
</div>
```

### Badge de estado
```tsx
<span className="badge-active">Confirmado</span>
<span className="badge-pending">Borrador</span>
<span className="badge-cancelled">Cancelado</span>
```

### KPI card (dashboard home)
```tsx
<div className="bg-card border border-border rounded-lg p-6">
  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Eventos este mes</p>
  <p className="text-3xl font-bold text-foreground mt-1">24</p>
  <p className="text-xs text-primary mt-1 flex items-center gap-1">
    <TrendingUp className="w-3 h-3" /> +12% vs mes anterior
  </p>
</div>
```

### Header de página
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-semibold text-foreground">Eventos</h1>
    <p className="text-sm text-muted-foreground mt-1">Gestiona todos tus eventos</p>
  </div>
  <Button className="bg-primary hover:bg-primary-hover text-white">
    <Plus className="w-4 h-4 mr-2" /> Nuevo evento
  </Button>
</div>
```

---

## LAYOUT DEL DASHBOARD

```
┌─────────────────────────────────────────────────┐
│  SIDEBAR (#422626)  │  TOPBAR (white + border)   │
│  Logo naranja       │  Breadcrumb + User avatar   │
│  ─────────────────  ├─────────────────────────── │
│  Nav item           │                             │
│  ▶ Nav ACTIVO 🟠    │   CONTENIDO PRINCIPAL       │
│  Nav item           │   bg: #f7f7f7               │
│  Nav item           │                             │
└─────────────────────┴─────────────────────────────┘
```

---

## REGLAS DE DISEÑO

1. **Naranja = acción** — Solo en botones CTA, estado activo y focus rings
2. **Nunca naranja en texto largo** — Solo en labels cortos, iconos o highlights
3. **Sidebar siempre oscuro** (`#422626`) — nunca fondo blanco en sidebar
4. **Espaciado** — `p-4`/`p-6` para cards, `gap-4` entre elementos
5. **Sombras suaves** — `shadow-sm` por defecto, `shadow-md` en modales
6. **Bordes finos** — `border border-border` siempre
7. **Rounded** — `rounded-lg` cards, `rounded-md` botones/inputs, `rounded-full` badges

---

## OUTPUT ESPERADO

`[SKILL_DESIGN] ✓ aplicado`
