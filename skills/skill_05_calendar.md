# SKILL 05 — Google Calendar Integrado
## Fase 2 | Sub-agente: Calendar Agent

---

## OBJETIVO
Integrar Google Calendar para visualizar y gestionar eventos directamente desde el dashboard.

## DEPENDENCIAS
- `skill_01_auth.md` — OAuth con Google configurado
- `skill_03_eventos.md` — Sincronizar eventos del sistema con Calendar

## CONFIGURACIÓN GOOGLE CALENDAR API

```typescript
// lib/google/calendar.ts
// Scopes necesarios:
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]
```

### Variables de Entorno
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## FUNCIONALIDADES

### Sincronización Bidireccional
- Eventos creados en el dashboard → se crean en Google Calendar
- Eventos de Google Calendar → se muestran en el dashboard
- Actualizar evento en dashboard → actualiza en Google Calendar
- Eliminar evento → elimina en ambos lados

### Vistas del Calendario
- **Vista mensual** — Cuadrícula con puntos de color por tipo
- **Vista semanal** — Columnas por día con bloques de tiempo
- **Vista diaria** — Timeline del día
- **Mini calendario** — Widget para el sidebar

### Múltiples Calendarios
- Calendario personal del usuario
- Calendario de empresa (eventos de trabajo)
- Calendario de equipo (disponibilidad)
- Color diferente por calendario

### Gestión de Eventos desde el Calendario
- Click en día vacío → crear nuevo evento
- Click en evento → ver/editar detalles
- Drag & drop para mover eventos
- Resize para cambiar duración

## API ROUTES A CREAR

```typescript
GET    /api/calendar/events          // Listar eventos (con rango de fechas)
POST   /api/calendar/events          // Crear evento
PUT    /api/calendar/events/[id]     // Actualizar evento
DELETE /api/calendar/events/[id]     // Eliminar evento
GET    /api/calendar/calendars       // Listar calendarios disponibles
POST   /api/calendar/sync            // Sincronización manual
```

## COMPONENTES REQUERIDOS
- `<CalendarView />` — Vista principal con FullCalendar
- `<EventoPopover />` — Popover al hacer click en evento
- `<EventoDrawer />` — Panel lateral para crear/editar
- `<CalendarSelector />` — Toggle de calendarios visibles
- `<MiniCalendar />` — Versión compacta para sidebar

## LIBRERÍA RECOMENDADA
Usar `@fullcalendar/react` con plugins:
- `@fullcalendar/daygrid` (vista mensual)
- `@fullcalendar/timegrid` (vista semanal/diaria)
- `@fullcalendar/interaction` (drag & drop)
- `@fullcalendar/google-calendar` (sincronización)

## OUTPUT ESPERADO
- Calendario completamente funcional con datos de Google
- Sincronización bidireccional operativa
- Crear/editar/eliminar eventos desde el dashboard

## CRITERIOS DE ACEPTACIÓN
- [ ] Eventos de Google Calendar aparecen en el dashboard
- [ ] Crear evento en dashboard lo crea en Google Calendar
- [ ] Drag & drop funciona y persiste
- [ ] Múltiples calendarios con colores diferenciados
- [ ] Vista móvil responsiva
