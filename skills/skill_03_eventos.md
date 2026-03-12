# SKILL 03 — Gestión de Eventos
## Fase 1 | Sub-agente: Eventos Agent

---

## OBJETIVO
Módulo completo para crear, gestionar y hacer seguimiento de eventos.

## DEPENDENCIAS
- `skill_01_auth.md` completado
- `skill_09_crm.md` para relación con clientes

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('boda', 'corporativo', 'cumpleaños', 'congreso', 'otro')),
  estado TEXT CHECK (estado IN ('prospecto', 'en_preparacion', 'confirmado', 'en_curso', 'finalizado', 'cancelado')) DEFAULT 'prospecto',
  fecha_evento DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  lugar TEXT,
  aforo INTEGER,
  cliente_id UUID REFERENCES clientes(id),
  presupuesto_total DECIMAL(10,2),
  notas TEXT,
  checklist JSONB DEFAULT '[]',
  equipo_asignado UUID[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evento_proveedores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES proveedores(id),
  servicio TEXT,
  coste DECIMAL(10,2),
  estado TEXT CHECK (estado IN ('pendiente', 'contratado', 'cancelado')) DEFAULT 'pendiente',
  notas TEXT
);

CREATE TABLE evento_fotos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## PÁGINAS A CREAR

### `/eventos` — Listado de Eventos
- Tabla/grid de todos los eventos
- Filtros: estado, tipo, mes, cliente
- Búsqueda por nombre
- Botón "Nuevo Evento"
- Vista tarjetas o lista (toggle)

### `/eventos/[id]` — Detalle del Evento
- Header: nombre, fecha, estado (editable)
- Tabs:
  - **Información general** — datos del evento
  - **Check-list** — lista de tareas de preparación
  - **Equipo** — empleados asignados
  - **Proveedores** — servicios contratados
  - **Contabilidad** — gastos e ingresos del evento
  - **Fotos** — galería post-evento
  - **Notas** — campo libre

### `/eventos/nuevo` — Crear Evento
- Formulario multi-paso:
  1. Datos básicos (nombre, tipo, fecha, lugar)
  2. Cliente (selector o crear nuevo)
  3. Presupuesto estimado
  4. Equipo asignado
  5. Check-list inicial

## CHECKLIST PREDEFINIDAS POR TIPO

```json
{
  "boda": [
    "Confirmar catering", "Reservar fotógrafo", "Contratar música",
    "Decoración floral", "Cake tasting", "Ensayo general"
  ],
  "corporativo": [
    "Reservar sala", "Equipos audiovisuales", "Catering coffee break",
    "Material impreso", "Registro de asistentes"
  ]
}
```

## COMPONENTES REQUERIDOS
- `<EventoCard />` — Tarjeta con estado colorizado
- `<EventoForm />` — Formulario multi-paso
- `<ChecklistWidget />` — Lista de verificación interactiva
- `<EventoTimeline />` — Línea temporal del evento
- `<EquipoSelector />` — Selector de empleados
- `<EstadoBadge />` — Badge con color por estado

## OUTPUT ESPERADO
- CRUD completo de eventos
- Sistema de checklist por evento
- Asignación de equipo y proveedores
- Galería de fotos con Supabase Storage

## CRITERIOS DE ACEPTACIÓN
- [ ] Crear, editar y eliminar eventos
- [ ] Cambiar estado del evento con historial
- [ ] Check-list funcional con porcentaje de completado
- [ ] Subir fotos al evento
- [ ] Filtros y búsqueda funcionan correctamente
