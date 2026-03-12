# SKILL 08 — Contabilidad con OCR
## Fase 3 | Sub-agente: Contabilidad Agent

---

## OBJETIVO
Sistema contable completo con OCR para escanear tickets y facturas, generando balance automático.

## DEPENDENCIAS
- `skill_01_auth.md` — Solo admin accede
- `skill_03_eventos.md` — Vincular gastos a eventos

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE movimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT CHECK (tipo IN ('ingreso', 'gasto')) NOT NULL,
  categoria TEXT CHECK (categoria IN (
    'catering', 'decoracion', 'audiovisual', 'fotografia',
    'transporte', 'personal', 'alquiler', 'otros_gasto',
    'honorarios', 'anticipo', 'liquidacion', 'otros_ingreso'
  )),
  concepto TEXT NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  fecha DATE NOT NULL,
  proveedor_cliente TEXT,
  numero_factura TEXT,
  evento_id UUID REFERENCES eventos(id),
  imagen_url TEXT,
  ocr_datos JSONB,
  verificado BOOLEAN DEFAULT FALSE,
  notas TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE presupuestos_contables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes INTEGER,
  año INTEGER,
  categoria TEXT,
  importe_previsto DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## FUNCIONALIDADES

### 1. Subida y OCR de Documentos

#### Flujo de trabajo
1. Usuario sube foto del ticket/factura
2. Imagen se sube a Supabase Storage
3. Se envía a Google Vision API para OCR
4. Se extraen: importe, fecha, concepto, proveedor, NIF
5. Se crea el movimiento pre-rellenado
6. Usuario revisa y confirma (o corrige)
7. Se marca como verificado

```typescript
// lib/ocr/processDocument.ts
interface OCRResult {
  importe: number
  fecha: string
  concepto: string
  proveedor: string
  nif?: string
  numero_factura?: string
  iva?: number
  base_imponible?: number
}

async function processTicketOCR(imageUrl: string): Promise<OCRResult>
```

### 2. Panel de Balance

#### KPIs del mes
- Total ingresos del mes
- Total gastos del mes
- **Beneficio neto** (ingresos - gastos)
- Comparativa con mes anterior (% variación)

#### Gráficas
- Barras: ingresos vs gastos por mes (últimos 12 meses)
- Donut: gastos por categoría
- Línea: evolución del balance acumulado
- Barras: ingresos/gastos por evento

### 3. Listado de Movimientos
- Tabla con filtros: tipo, categoría, fecha, evento
- Exportar a Excel y PDF
- Edición inline de movimientos
- Adjuntar/ver imagen original del ticket

### 4. Gestión de IVA
- Separar base imponible e IVA
- Resumen de IVA a declarar (trimestral)
- Tipos de IVA: 21%, 10%, 4%, 0%

## PÁGINAS A CREAR

### `/contabilidad` — Dashboard Contable
- KPIs del mes en tarjetas superiores
- Gráfica de barras mensual (12 meses)
- Últimos movimientos
- Botón: "+ Añadir movimiento"
- Botón: "📷 Escanear ticket"

### `/contabilidad/movimientos` — Listado completo
- Tabla paginada con todos los movimientos
- Filtros avanzados
- Exportar

### `/contabilidad/nuevo` — Añadir movimiento manual
- Formulario: tipo, categoría, concepto, importe, fecha
- Opción de subir imagen

### `/contabilidad/escanear` — OCR
- Zona de drag & drop o cámara
- Preview del documento subido
- Formulario pre-rellenado con datos OCR
- Botón "Confirmar y guardar"

### `/contabilidad/informe` — Informes
- Seleccionar rango de fechas
- Balance completo con gráficas
- Desglose por evento
- Exportar PDF

## COMPONENTES REQUERIDOS
- `<BalanceKPI />` — Tarjetas de KPIs
- `<BalanceChart />` — Gráfica mensual (Recharts)
- `<CategoriaDonut />` — Gráfica de categorías
- `<MovimientoTable />` — Tabla con filtros
- `<OCRUploader />` — Zona de subida con preview
- `<OCRForm />` — Formulario post-OCR con edición
- `<ExportButton />` — Exportar a Excel/PDF

## OUTPUT ESPERADO
- Sistema OCR funcional con Google Vision API
- Balance en tiempo real con gráficas
- Exportación de informes a PDF y Excel
- Desglose contable por evento

## CRITERIOS DE ACEPTACIÓN
- [ ] Subir foto de ticket extrae datos automáticamente (OCR)
- [ ] Balance se actualiza al añadir movimiento
- [ ] Gráficas muestran datos reales de los últimos 12 meses
- [ ] Exportar a PDF genera informe legible
- [ ] Filtrar por evento muestra solo sus movimientos
- [ ] Cálculo de IVA trimestral correcto
