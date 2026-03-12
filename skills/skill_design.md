# SKILL — Sistema de Diseño y UI/UX
## Transversal | Aplicar en todo componente visual

---

## IDENTIDAD VISUAL

### Paleta de Colores
```css
/* Colores primarios — personalizar en globals.css */
:root {
  --primary: 221 83% 53%;        /* Azul corporativo */
  --primary-foreground: 0 0% 98%;

  --secondary: 210 40% 96%;
  --accent: 142 71% 45%;         /* Verde éxito */
  --destructive: 0 84% 60%;      /* Rojo error/eliminar */
  --warning: 38 92% 50%;         /* Amarillo advertencia */
}
```

### Colores de Estado (consistentes en toda la app)
```typescript
const ESTADO_COLORES = {
  // Eventos
  prospecto:      'bg-gray-100 text-gray-700',
  en_preparacion: 'bg-yellow-100 text-yellow-700',
  confirmado:     'bg-blue-100 text-blue-700',
  en_curso:       'bg-green-100 text-green-700',
  finalizado:     'bg-purple-100 text-purple-700',
  cancelado:      'bg-red-100 text-red-700',

  // Prioridades (Scrum)
  baja:    'bg-gray-100 text-gray-600',
  media:   'bg-blue-100 text-blue-700',
  alta:    'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
}
```

## TIPOGRAFÍA

```css
/* Font: Inter (Google Fonts) */
/* Escala tipográfica */
.text-xs  { font-size: 0.75rem; }   /* 12px — labels, badges */
.text-sm  { font-size: 0.875rem; }  /* 14px — body secundario */
.text-base{ font-size: 1rem; }      /* 16px — body principal */
.text-lg  { font-size: 1.125rem; }  /* 18px — subtítulos */
.text-xl  { font-size: 1.25rem; }   /* 20px — títulos sección */
.text-2xl { font-size: 1.5rem; }    /* 24px — títulos página */
.text-3xl { font-size: 1.875rem; }  /* 30px — KPIs destacados */
```

## COMPONENTES DE DISEÑO

### KPI Card
```typescript
// Anatomía: icono + label + valor + tendencia
<KPICard
  icono={<Euro className="h-5 w-5" />}
  label="Facturación del mes"
  valor="12.450 €"
  tendencia="+12% vs mes anterior"
  tendenciaPositiva={true}
/>
```

### Status Badge
```typescript
// Pill redondeado con color semántico
<Badge variant="outline" className={ESTADO_COLORES[estado]}>
  {ESTADO_LABELS[estado]}
</Badge>
```

### Empty State
```typescript
// Siempre mostrar cuando no hay datos
function EmptyState({ mensaje, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{mensaje}</h3>
      {accion && <Button className="mt-4">{accion}</Button>}
    </div>
  )
}
```

## LAYOUT SYSTEM

### Sidebar Navigation
- Ancho: 240px (expandido) / 60px (colapsado)
- En móvil: Drawer (slide desde la izquierda)
- Elemento activo: fondo `bg-primary/10` + borde izquierdo `border-l-2 border-primary`
- Iconos consistentes de `lucide-react`

### Página estándar
```typescript
// Estructura de cada página
<PageLayout>
  <PageHeader
    titulo="Gestión de Eventos"
    descripcion="Administra todos tus eventos"
    accion={<Button>+ Nuevo evento</Button>}
  />
  <PageContent>
    {/* Contenido principal */}
  </PageContent>
</PageLayout>
```

### Grids responsivos
```
Móvil:    1 columna
Tablet:   2 columnas
Desktop:  3-4 columnas según contenido
```

## FEEDBACK AL USUARIO

### Toasts (notificaciones temporales)
```typescript
// Usar sonner para toasts
import { toast } from 'sonner'

toast.success('Evento creado correctamente')
toast.error('Error al guardar. Inténtalo de nuevo.')
toast.loading('Guardando...')
toast.promise(saveEvento(), {
  loading: 'Guardando evento...',
  success: 'Evento guardado',
  error: 'Error al guardar'
})
```

### Estados de botones
```typescript
// ✅ Siempre mostrar loading al hacer submit
<Button disabled={isLoading}>
  {isLoading ? (
    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Guardando...</>
  ) : 'Guardar'}
</Button>
```

### Confirmaciones destructivas
```typescript
// Siempre usar Dialog de confirmación para eliminar
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Eliminar</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
    <AlertDialogDescription>
      Esta acción no se puede deshacer.
    </AlertDialogDescription>
    <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
    <AlertDialogCancel>Cancelar</AlertDialogCancel>
  </AlertDialogContent>
</AlertDialog>
```

## ICONOGRAFÍA
- Librería: `lucide-react` (consistente con shadcn)
- Tamaños estándar: `h-4 w-4` (inline), `h-5 w-5` (botones), `h-6 w-6` (nav)
- Siempre con `aria-label` si es el único contenido del botón

## ANIMACIONES
```typescript
// ✅ Transiciones sutiles (no distractoras)
"transition-colors duration-200"   // Hover de botones
"transition-all duration-300"      // Expansión de paneles
"animate-spin"                     // Loading spinners

// ✅ Framer Motion para animaciones complejas
// Solo en: entrada de modales, animaciones de kanban, gráficas
```

## CHECKLIST DE DISEÑO

- [ ] Colores de estado consistentes en toda la app
- [ ] KPI cards con icono + valor + tendencia
- [ ] Empty states en listas vacías
- [ ] Loading states con skeletons
- [ ] Confirmación para acciones destructivas
- [ ] Toasts de feedback tras cada acción
- [ ] Botones con estado loading al hacer submit
- [ ] Iconos de lucide-react con aria-label
- [ ] Responsive verificado en 3 breakpoints
- [ ] Dark mode sin colores hardcodeados
