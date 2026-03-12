# SKILL 04 — Tablero Scrum del Equipo
## Fase 1 | Sub-agente: Scrum Agent

---

## OBJETIVO
Tablero Kanban interactivo para gestión de tareas del equipo con roles diferenciados.

## DEPENDENCIAS
- `skill_01_auth.md` completado
- `skill_03_eventos.md` para vincular tareas a eventos

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE tareas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT CHECK (estado IN ('pendiente', 'en_progreso', 'revision', 'completado')) DEFAULT 'pendiente',
  prioridad TEXT CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')) DEFAULT 'media',
  asignado_a UUID REFERENCES profiles(id),
  creado_por UUID REFERENCES profiles(id),
  evento_id UUID REFERENCES eventos(id),
  fecha_limite DATE,
  etiquetas TEXT[] DEFAULT '{}',
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tarea_comentarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
  autor_id UUID REFERENCES profiles(id),
  contenido TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tarea_adjuntos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tarea_historial (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES profiles(id),
  campo TEXT,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## PÁGINAS A CREAR

### `/scrum` — Tablero Kanban Principal
```
┌──────────┬────────────┬───────────┬─────────────┐
│ PENDIENTE│ EN PROGRESO│  REVISIÓN │  COMPLETADO  │
├──────────┼────────────┼───────────┼─────────────┤
│ [Tarea]  │  [Tarea]   │  [Tarea]  │   [Tarea]   │
│ [Tarea]  │  [Tarea]   │           │   [Tarea]   │
│ [Tarea]  │            │           │             │
│  + Add   │   + Add    │   + Add   │    + Add    │
└──────────┴────────────┴───────────┴─────────────┘
```
- Drag & drop entre columnas
- Filtrar por: empleado, evento, prioridad, etiqueta
- Vista admin: todas las tareas del equipo
- Vista empleado: solo sus tareas asignadas

### `/scrum/[id]` — Detalle de Tarea (modal o página)
- Título y descripción editables
- Cambiar estado, prioridad, asignado
- Comentarios en tiempo real
- Adjuntar archivos
- Historial de cambios
- Fecha límite con alerta visual

## FUNCIONALIDADES CLAVE

### Drag & Drop
- Usar `@hello-pangea/dnd` o `dnd-kit`
- Actualizar orden y estado en Supabase al soltar
- Animaciones suaves al mover

### Notificaciones al Empleado
- Cuando se asigna una tarea nueva → notificación en app + Telegram
- Cuando se acerca la fecha límite → alerta visual
- Cuando admin comenta → notificación

### Vista por Evento
- Filtrar tablero por evento específico
- Ver avance total del evento en % de tareas completadas

### Estadísticas del Equipo (solo admin)
- Tareas completadas por empleado esta semana
- Tiempo medio de resolución
- Tareas vencidas

## COMPONENTES REQUERIDOS
- `<KanbanBoard />` — Tablero completo con columnas
- `<KanbanColumn />` — Columna individual
- `<TareaCard />` — Tarjeta draggable con prioridad colorizada
- `<TareaModal />` — Detalle completo de la tarea
- `<ComentariosList />` — Hilo de comentarios en tiempo real
- `<PrioridadBadge />` — Indicador visual de prioridad
- `<AsignadoAvatar />` — Avatar del empleado asignado
- `<TeamStats />` — Panel de estadísticas (solo admin)

## OUTPUT ESPERADO
- Tablero Kanban con drag & drop funcional
- Tareas con comentarios en tiempo real (Supabase Realtime)
- Sistema de notificaciones al asignar tareas
- Vista diferenciada admin/empleado

## CRITERIOS DE ACEPTACIÓN
- [ ] Drag & drop mueve tarjetas y persiste en DB
- [ ] Empleado solo ve sus tareas
- [ ] Admin puede crear y asignar tareas a cualquier empleado
- [ ] Comentarios aparecen en tiempo real sin recargar
- [ ] Notificación al asignar tarea (in-app + Telegram)
- [ ] Fecha límite vencida se muestra en rojo
