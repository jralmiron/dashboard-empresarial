# SKILL 02 — Panel de Control (Dashboard Home)
## Fase 1 | Sub-agente: Dashboard Agent

---

## OBJETIVO
Crear el panel de control principal con KPIs, resumen del día y acceso rápido a todos los módulos.

## DEPENDENCIAS
- `skill_01_auth.md` completado (requiere sesión activa)
- `skill_design.md` aplicado
- `skill_frontend.md` aplicado

## TAREAS

### 1. KPIs Principales (tarjetas superiores)
- Eventos confirmados este mes
- Facturación del mes (ingresos vs gastos)
- Tareas pendientes del equipo
- Emails sin leer
- Próximo evento (días restantes)

### 2. Widgets del Dashboard

#### Widget: Próximos Eventos (7 días)
- Lista de eventos con fecha, cliente y estado
- Color por estado: verde=confirmado, amarillo=en preparación, rojo=urgente

#### Widget: Tareas Pendientes
- Mis tareas (si eres empleado)
- Todas las tareas del equipo (si eres admin)
- Indicador de prioridad

#### Widget: Balance del Mes
- Gráfica de barras: ingresos vs gastos
- Saldo neto destacado
- Comparativa con mes anterior

#### Widget: Actividad Reciente
- Últimas acciones del equipo
- Tareas completadas, eventos creados, facturas añadidas

#### Widget: Agenda del Día
- Eventos de Google Calendar del día actual
- Mini calendario

### 3. Layout del Dashboard
```
┌─────────────────────────────────────────────┐
│  NAVBAR: Logo | Menú | Notificaciones | User │
├──────┬──────────────────────────────────────┤
│      │  [KPI] [KPI] [KPI] [KPI] [KPI]       │
│ SIDE │                                       │
│ BAR  │  [Próx. Eventos]  [Balance Mes]       │
│      │                                       │
│      │  [Tareas Pend.]   [Actividad Rec.]    │
│      │                                       │
│      │  [Agenda del Día]                     │
└──────┴──────────────────────────────────────┘
```

### 4. Navegación Lateral (Sidebar)
```
📊 Dashboard
📅 Calendario
✉️  Email
📋 Scrum / Tareas
💰 Contabilidad
👥 Clientes
🎪 Eventos
📄 Presupuestos
⚙️  Configuración
```

### 5. Sistema de Notificaciones
- Badge contador en el icono de campana
- Panel dropdown con últimas notificaciones
- Marcar como leída
- Tipos: tarea asignada, evento próximo, factura subida, email nuevo

### 6. Componentes Requeridos
- `<KPICard />` — Tarjeta con título, valor, icono y tendencia
- `<Sidebar />` — Navegación lateral colapsable
- `<Navbar />` — Barra superior con búsqueda y perfil
- `<NotificationPanel />` — Panel de notificaciones
- `<EventoCard />` — Tarjeta resumen de evento
- `<BalanceChart />` — Gráfica con Recharts

## DATOS DE EJEMPLO (para desarrollo)
Crear seed de datos en Supabase con:
- 3 eventos de ejemplo
- 5 tareas de ejemplo
- 2 empleados de ejemplo
- Movimientos contables del mes

## OUTPUT ESPERADO
- Dashboard home completamente funcional
- Todos los widgets con datos reales de Supabase
- Sidebar navegable a todos los módulos
- Notificaciones en tiempo real con Supabase Realtime

## CRITERIOS DE ACEPTACIÓN
- [ ] Dashboard carga en menos de 2 segundos
- [ ] KPIs muestran datos reales
- [ ] Sidebar funciona en móvil (drawer) y escritorio
- [ ] Notificaciones llegan en tiempo real
- [ ] Dark/Light mode funciona en todos los widgets
