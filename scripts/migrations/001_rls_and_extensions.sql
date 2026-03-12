-- ============================================================
-- MIGRACIÓN 001 — RLS + pgvector
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Proyecto: pdqmhqatjcaehtwgpzdx
-- ============================================================

-- ── 1. Extensiones ──────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;      -- Para RAG con DeepSeek
CREATE EXTENSION IF NOT EXISTS pg_trgm;    -- Para búsqueda de texto

-- ── 2. RLS en todas las tablas ──────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients  ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets  ENABLE ROW LEVEL SECURITY;

-- ── 3. Políticas de profiles ─────────────────────────────────
-- Admin ve y modifica todo; empleado solo su propio perfil

DROP POLICY IF EXISTS "profiles_admin_all"    ON profiles;
DROP POLICY IF EXISTS "profiles_self_select"  ON profiles;
DROP POLICY IF EXISTS "profiles_self_update"  ON profiles;

CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_self_select" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ── 4. Políticas de events ───────────────────────────────────
DROP POLICY IF EXISTS "events_authenticated_read"   ON events;
DROP POLICY IF EXISTS "events_admin_write"          ON events;

CREATE POLICY "events_authenticated_read" ON events
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "events_admin_write" ON events
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ── 5. Políticas de tasks ────────────────────────────────────
DROP POLICY IF EXISTS "tasks_read"        ON tasks;
DROP POLICY IF EXISTS "tasks_assignee"    ON tasks;
DROP POLICY IF EXISTS "tasks_admin"       ON tasks;

CREATE POLICY "tasks_read" ON tasks
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "tasks_assignee" ON tasks
  FOR UPDATE TO authenticated
  USING (assignee_id = auth.uid())
  WITH CHECK (assignee_id = auth.uid());

CREATE POLICY "tasks_admin" ON tasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'manager')
    )
  );

-- ── 6. Políticas de clients ──────────────────────────────────
DROP POLICY IF EXISTS "clients_authenticated" ON clients;

CREATE POLICY "clients_authenticated" ON clients
  FOR ALL TO authenticated
  USING (deleted_at IS NULL);

-- ── 7. Políticas de budgets ──────────────────────────────────
DROP POLICY IF EXISTS "budgets_authenticated" ON budgets;

CREATE POLICY "budgets_authenticated" ON budgets
  FOR ALL TO authenticated
  USING (deleted_at IS NULL);

-- ── 8. Función helper para crear perfil al registrarse ───────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'staff'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Fin de migración 001 ─────────────────────────────────────
-- Verificar: SELECT * FROM pg_extension WHERE extname = 'vector';
