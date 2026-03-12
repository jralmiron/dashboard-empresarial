# SKILL 09 — CRM de Clientes
## Fase 3 | Sub-agente: CRM Agent

---

## OBJETIVO
Gestión completa de clientes con historial, pipeline de ventas y seguimiento de comunicaciones.

## DEPENDENCIAS
- `skill_01_auth.md` completado
- `skill_03_eventos.md` — Vincular eventos al cliente

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  empresa TEXT,
  email TEXT,
  telefono TEXT,
  nif_cif TEXT,
  direccion TEXT,
  ciudad TEXT,
  codigo_postal TEXT,
  estado TEXT CHECK (estado IN ('prospecto', 'activo', 'recurrente', 'inactivo')) DEFAULT 'prospecto',
  fuente TEXT CHECK (fuente IN ('web', 'referido', 'instagram', 'llamada', 'email', 'otro')),
  notas TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cliente_interacciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT CHECK (tipo IN ('email', 'llamada', 'reunion', 'whatsapp', 'nota')),
  descripcion TEXT NOT NULL,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  creado_por UUID REFERENCES profiles(id)
);

CREATE TABLE oportunidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  nombre TEXT NOT NULL,
  tipo_evento TEXT,
  fecha_evento DATE,
  presupuesto_estimado DECIMAL(10,2),
  estado TEXT CHECK (estado IN ('contacto', 'propuesta', 'negociacion', 'ganado', 'perdido')) DEFAULT 'contacto',
  probabilidad INTEGER CHECK (probabilidad BETWEEN 0 AND 100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## FUNCIONALIDADES

### 1. Listado de Clientes
- Tabla con búsqueda y filtros por estado/fuente/ciudad
- Vista tarjeta o lista (toggle)
- Indicador visual de estado
- Número de eventos realizados
- Último contacto

### 2. Ficha del Cliente (`/clientes/[id]`)

#### Tabs:
- **Resumen** — Datos de contacto + KPIs del cliente
- **Eventos** — Todos los eventos realizados
- **Oportunidades** — Pipeline de ventas
- **Comunicaciones** — Historial de interacciones
- **Documentos** — Presupuestos, contratos, facturas
- **Notas** — Campo libre

#### KPIs del cliente
- Total facturado (suma de todos sus eventos)
- Número de eventos realizados
- Último evento
- Próximo evento
- Valor promedio por evento

### 3. Pipeline de Ventas (Kanban)
```
Contacto → Propuesta enviada → Negociación → Ganado ✓ / Perdido ✗
```
- Vista Kanban de todas las oportunidades
- Valor total en cada etapa
- Probabilidad de cierre por oportunidad
- Previsión de ingresos

### 4. Historial de Comunicaciones
- Registrar llamadas, emails, reuniones
- Automático: emails de Gmail vinculados por dirección
- Timeline cronológico
- Próxima acción pendiente

### 5. Importar/Exportar Clientes
- Importar desde CSV/Excel
- Exportar listado a Excel
- Deduplicar por email/NIF

## PÁGINAS A CREAR

### `/clientes` — Listado
- Tabla con filtros + buscador
- Botón "+ Nuevo cliente"
- Pipeline toggle: tabla o kanban

### `/clientes/[id]` — Ficha completa
- Layout con tabs
- Edición inline de datos de contacto
- Historial de comunicaciones

### `/clientes/nuevo` — Crear cliente
- Formulario con validación
- Detección de duplicados por email

### `/clientes/pipeline` — Vista Kanban de oportunidades

## COMPONENTES REQUERIDOS
- `<ClienteCard />` — Tarjeta con estado colorizado
- `<ClienteForm />` — Formulario de cliente
- `<InteraccionTimeline />` — Timeline de comunicaciones
- `<OportunidadKanban />` — Pipeline de ventas
- `<ClienteKPIs />` — Métricas del cliente
- `<DocumentosList />` — Lista de documentos adjuntos

## OUTPUT ESPERADO
- CRM completo con pipeline de ventas
- Historial de comunicaciones vinculado con Gmail
- KPIs por cliente
- Importación desde CSV

## CRITERIOS DE ACEPTACIÓN
- [ ] CRUD completo de clientes
- [ ] Historial de comunicaciones visible en ficha
- [ ] Pipeline kanban funcional con drag & drop
- [ ] Emails de Gmail vinculados automáticamente al cliente
- [ ] Exportar listado a Excel funciona
- [ ] Ficha muestra todos los eventos del cliente
