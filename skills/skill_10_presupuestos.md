# SKILL 10 — Presupuestos y Facturación
## Fase 3 | Sub-agente: Presupuestos Agent

---

## OBJETIVO
Sistema completo de presupuestos y facturas: creación, envío por email, conversión y cobro.

## DEPENDENCIAS
- `skill_09_crm.md` — Clientes
- `skill_03_eventos.md` — Vincular a eventos
- `skill_06_email.md` — Enviar por email
- `skill_08_contabilidad.md` — Registrar como ingreso al cobrar

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE presupuestos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,     -- PRE-2026-001
  cliente_id UUID REFERENCES clientes(id),
  evento_id UUID REFERENCES eventos(id),
  estado TEXT CHECK (estado IN ('borrador', 'enviado', 'aceptado', 'rechazado', 'expirado', 'facturado')) DEFAULT 'borrador',
  fecha_emision DATE DEFAULT CURRENT_DATE,
  fecha_validez DATE,
  subtotal DECIMAL(10,2),
  iva_porcentaje DECIMAL(5,2) DEFAULT 21,
  iva_importe DECIMAL(10,2),
  total DECIMAL(10,2),
  notas TEXT,
  condiciones TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE presupuesto_lineas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presupuesto_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10,2) DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  iva_porcentaje DECIMAL(5,2) DEFAULT 21,
  subtotal DECIMAL(10,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  orden INTEGER DEFAULT 0
);

CREATE TABLE facturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero TEXT UNIQUE NOT NULL,     -- FAC-2026-001
  presupuesto_id UUID REFERENCES presupuestos(id),
  cliente_id UUID REFERENCES clientes(id),
  evento_id UUID REFERENCES eventos(id),
  estado TEXT CHECK (estado IN ('emitida', 'enviada', 'cobrada', 'vencida', 'anulada')) DEFAULT 'emitida',
  fecha_emision DATE DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  fecha_cobro DATE,
  subtotal DECIMAL(10,2),
  iva_importe DECIMAL(10,2),
  total DECIMAL(10,2),
  metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'efectivo', 'tarjeta', 'bizum')),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plantillas_presupuesto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo_evento TEXT,
  lineas JSONB NOT NULL,
  condiciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## FUNCIONALIDADES

### 1. Crear Presupuesto
- Seleccionar cliente (o crear desde el formulario)
- Vincular a evento (opcional)
- Añadir líneas de servicio dinámicamente
- Cálculo automático de subtotal, IVA y total
- Aplicar plantilla predefinida
- Notas y condiciones personalizables
- Numeración automática (PRE-AÑO-NÚMERO)

### 2. PDF del Presupuesto
- Diseño profesional con logo de la empresa
- Datos del emisor y receptor
- Tabla de líneas con subtotales
- Totales con IVA desglosado
- Condiciones y validez
- Generar con `@react-pdf/renderer`

### 3. Envío por Email
- Enviar PDF adjunto directamente desde el sistema
- Plantilla de email predefinida
- Registrar envío en historial del cliente
- Cambiar estado a "enviado" automáticamente

### 4. Convertir a Factura
- Un click para convertir presupuesto aceptado en factura
- Numeración automática de factura (FAC-AÑO-NÚMERO)
- Heredar todas las líneas del presupuesto
- Establecer fecha de vencimiento

### 5. Gestión de Cobros
- Marcar factura como cobrada con fecha y método de pago
- Al cobrar → registrar ingreso automáticamente en contabilidad
- Alertas de facturas vencidas (en dashboard y Telegram)

### 6. Plantillas Predefinidas
```json
[
  {
    "nombre": "Boda completa",
    "lineas": [
      { "descripcion": "Coordinación general del evento", "precio": 1500 },
      { "descripcion": "Decoración floral", "precio": 800 },
      { "descripcion": "Gestión de proveedores", "precio": 500 }
    ]
  },
  {
    "nombre": "Evento corporativo",
    "lineas": [
      { "descripcion": "Organización y coordinación", "precio": 1200 },
      { "descripcion": "Audiovisuales y técnica", "precio": 600 }
    ]
  }
]
```

## PÁGINAS A CREAR

### `/presupuestos` — Listado
- Tabla: número, cliente, evento, total, estado, fecha
- Filtros por estado
- KPIs: total presupuestado, total aceptado, total facturado

### `/presupuestos/[id]` — Detalle
- Vista del presupuesto con líneas
- Botones de acción por estado
- Historial de estados

### `/presupuestos/nuevo` — Crear
- Formulario con líneas dinámicas
- Selector de plantilla
- Preview en tiempo real

### `/facturas` — Listado de facturas
- Con indicadores de cobradas/pendientes/vencidas
- Acciones: descargar PDF, marcar como cobrada

## COMPONENTES REQUERIDOS
- `<PresupuestoForm />` — Formulario con líneas dinámicas
- `<LineaItem />` — Fila editable de concepto+importe
- `<TotalesResumen />` — Cálculo en tiempo real
- `<PresupuestoPDF />` — Template PDF con react-pdf
- `<EstadoPresupuesto />` — Badge con historial de estados
- `<FacturaCard />` — Tarjeta con estado de cobro

## OUTPUT ESPERADO
- Presupuestos y facturas con PDF profesional
- Envío por email desde la app
- Conversión presupuesto → factura en 1 click
- Registro automático en contabilidad al cobrar

## CRITERIOS DE ACEPTACIÓN
- [ ] Crear presupuesto con líneas dinámicas y calcular totales
- [ ] Generar PDF descargable con diseño profesional
- [ ] Enviar por email con adjunto
- [ ] Convertir a factura conserva todas las líneas
- [ ] Marcar como cobrado registra ingreso en contabilidad
- [ ] Alertas de facturas vencidas aparecen en dashboard
