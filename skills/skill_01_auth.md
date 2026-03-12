# SKILL 01 — Autenticación y Gestión de Roles
## Fase 1 | Sub-agente: Auth Agent

---

## OBJETIVO
Implementar el sistema de autenticación completo con roles y permisos usando Supabase Auth.

## DEPENDENCIAS
- Supabase proyecto inicializado
- Variables de entorno configuradas
- `skill_security.md` aplicado obligatoriamente

## TAREAS

### 1. Configuración Supabase Auth
- [ ] Configurar proveedor email/password
- [ ] Configurar OAuth con Google (para Calendar y Gmail)
- [ ] Políticas RLS (Row Level Security) en todas las tablas
- [ ] Tokens JWT con claims de rol

### 2. Esquema de Base de Datos
```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  email TEXT UNIQUE NOT NULL,
  rol TEXT CHECK (rol IN ('admin', 'empleado')) DEFAULT 'empleado',
  avatar_url TEXT,
  telefono TEXT,
  telegram_chat_id BIGINT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Admin ve todo, empleado solo su perfil
CREATE POLICY "admin_all" ON profiles FOR ALL USING (auth.jwt() ->> 'rol' = 'admin');
CREATE POLICY "empleado_self" ON profiles FOR SELECT USING (auth.uid() = id);
```

### 3. Páginas a Crear
- `/login` — Formulario email + password con validación
- `/register` — Solo accesible por admin (invitación por email)
- `/perfil` — Editar datos personales

### 4. Middleware de Protección de Rutas
```typescript
// middleware.ts
// Proteger todas las rutas /dashboard/*
// Redirigir a /login si no hay sesión
// Verificar rol para rutas admin-only
```

### 5. Componentes Requeridos
- `<LoginForm />` — Formulario de login con shadcn
- `<UserMenu />` — Avatar + nombre + logout en la navbar
- `<RoleGuard role="admin">` — HOC para proteger UI por rol
- `<AuthProvider />` — Context de sesión global

## ROLES Y PERMISOS

| Acción | Admin | Empleado |
|---|---|---|
| Ver todas las tareas | ✓ | Solo las suyas |
| Crear/asignar tareas | ✓ | ✗ |
| Ver contabilidad | ✓ | ✗ |
| Gestionar empleados | ✓ | ✗ |
| Ver su tablero | ✓ | ✓ |
| Actualizar estado tarea | ✓ | ✓ |
| Ver calendario | ✓ | ✓ |

## VARIABLES DE ENTORNO NECESARIAS
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## OUTPUT ESPERADO
- Sistema de auth funcional con login/logout
- Middleware de rutas protegidas
- Roles admin y empleado operativos
- RLS configurado en Supabase

## CRITERIOS DE ACEPTACIÓN
- [ ] Login con email/password funciona
- [ ] Redirige a /dashboard tras login exitoso
- [ ] Redirige a /login si ruta protegida sin sesión
- [ ] Admin ve menú completo, empleado ve menú limitado
- [ ] Logout limpia sesión correctamente
