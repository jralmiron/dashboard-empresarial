# SKILL — Base de Datos y Modelado
## Transversal | Supabase + PostgreSQL + Prisma

---

## CONVENCIONES DE BASE DE DATOS

### Nombres
```sql
-- ✅ snake_case para tablas y columnas
CREATE TABLE evento_proveedores (...)
-- ✅ UUIDs como primary keys (gen_random_uuid())
-- ✅ timestamps: created_at, updated_at (TIMESTAMPTZ no TIMESTAMP)
-- ✅ soft delete: deleted_at (nullable) en lugar de DELETE
```

### Campos Estándar en Cada Tabla
```sql
id           UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
created_by   UUID REFERENCES profiles(id)
```

### Auto-actualizar updated_at
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a cada tabla con updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON eventos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## SCHEMA COMPLETO DEL PROYECTO

```sql
-- ORDEN DE CREACIÓN (respetar dependencias)
1. profiles          (extiende auth.users)
2. clientes
3. proveedores
4. eventos           (FK: clientes, profiles)
5. evento_proveedores(FK: eventos, proveedores)
6. evento_fotos      (FK: eventos)
7. tareas            (FK: eventos, profiles)
8. tarea_comentarios (FK: tareas, profiles)
9. tarea_adjuntos    (FK: tareas)
10. tarea_historial  (FK: tareas, profiles)
11. movimientos      (FK: eventos, profiles)
12. presupuestos     (FK: clientes, eventos, profiles)
13. presupuesto_lineas (FK: presupuestos)
14. facturas         (FK: presupuestos, clientes, eventos)
15. cliente_interacciones (FK: clientes, profiles)
16. oportunidades    (FK: clientes)
17. plantillas_presupuesto
```

## ROW LEVEL SECURITY (RLS)

### Patrón para cada tabla
```sql
-- 1. Habilitar RLS
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;

-- 2. Admin: acceso total
CREATE POLICY "admin_all_tareas"
  ON tareas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );

-- 3. Empleado: solo sus filas
CREATE POLICY "empleado_own_tareas"
  ON tareas FOR SELECT
  USING (asignado_a = auth.uid());

CREATE POLICY "empleado_update_own_tareas"
  ON tareas FOR UPDATE
  USING (asignado_a = auth.uid())
  WITH CHECK (asignado_a = auth.uid());
```

## MIGRACIONES

```
supabase/
  migrations/
    001_init_profiles.sql
    002_init_clientes.sql
    003_init_eventos.sql
    004_init_tareas.sql
    005_init_contabilidad.sql
    006_init_presupuestos.sql
    007_rls_policies.sql
    008_indexes.sql
    009_triggers.sql
    010_seed_data.sql
```

### Buenas prácticas de migraciones
```sql
-- ✅ Idempotentes: IF NOT EXISTS
CREATE TABLE IF NOT EXISTS eventos (...);

-- ✅ Reversibles: incluir DOWN migration en comentario
-- DOWN: DROP TABLE IF EXISTS eventos;

-- ✅ Pequeñas y atómicas: una responsabilidad por migración
-- ❌ No mezclar crear tabla + insertar datos + crear índices
```

## CONSULTAS OPTIMIZADAS

### Joins eficientes con Supabase
```typescript
// ✅ Un solo query con relaciones
const { data } = await supabase
  .from('tareas')
  .select(`
    id, titulo, estado, prioridad,
    asignado: profiles!asignado_a (nombre, avatar_url),
    evento: eventos (nombre, fecha_evento)
  `)
  .eq('estado', 'en_progreso')
  .order('fecha_limite', { ascending: true })
```

### Agregaciones para KPIs
```typescript
// ✅ Calcular en DB, no en JavaScript
const { data } = await supabase.rpc('get_balance_mes', {
  p_mes: new Date().getMonth() + 1,
  p_año: new Date().getFullYear()
})

// Función en PostgreSQL:
CREATE OR REPLACE FUNCTION get_balance_mes(p_mes INT, p_año INT)
RETURNS TABLE(ingresos DECIMAL, gastos DECIMAL, balance DECIMAL) AS $$
  SELECT
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN importe END), 0),
    COALESCE(SUM(CASE WHEN tipo = 'gasto' THEN importe END), 0),
    COALESCE(SUM(CASE WHEN tipo = 'ingreso' THEN importe ELSE -importe END), 0)
  FROM movimientos
  WHERE EXTRACT(MONTH FROM fecha) = p_mes
    AND EXTRACT(YEAR FROM fecha) = p_año
$$ LANGUAGE SQL;
```

## STORAGE BUCKETS

```
avatars/           → fotos de perfil (público)
evento-fotos/      → galería de eventos (privado)
documentos/        → presupuestos PDF, contratos (privado)
tickets-facturas/  → imágenes OCR (privado solo admin)
```

```sql
-- Políticas de Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Solo el propietario puede subir su avatar
CREATE POLICY "avatar_upload_own"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## CHECKLIST BASE DE DATOS

- [ ] RLS activado en TODAS las tablas
- [ ] Políticas para admin y empleado en tablas con datos sensibles
- [ ] Índices en columnas de filtro frecuente
- [ ] Trigger updated_at en tablas con ese campo
- [ ] Migraciones numeradas y en orden
- [ ] Buckets de Storage con políticas correctas
- [ ] Funciones PostgreSQL para KPIs complejos
- [ ] Datos sensibles no en columnas sin RLS
