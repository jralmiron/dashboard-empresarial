# ORQUESTACIÓN SDD — Dashboard Empresarial
## Somos Gastronómico | Última actualización: 2026-03-12

---

## ESTADO ACTUAL

### ✅ COMPLETADO (en rama `feat/testing-and-security-audit`, PR abierto)
| Área | Detalle |
|---|---|
| Infraestructura base | Next.js 14 + Supabase + Prisma schema + Tailwind brand |
| Seguridad | AES-256-GCM, bcrypt, HMAC, middleware rutas |
| IA base | Groq client (llama-3.1, mixtral) |
| Auth UI | Login page, Server Actions, Zod validation |
| Dashboard layout | Sidebar + Navbar + Home page |
| UI Components | Button, Input, Label, Card |
| Testing | Vitest 21/21 + Playwright E2E + security audit script |
| GitHub Actions CI | lint, type-check, unit tests, build, security, E2E |
| Despliegue | https://dashboardempresarial.vercel.app |

### ⏳ BLOQUEADO — Requiere credenciales Supabase
- Login funcional en producción
- Migraciones de base de datos (pgvector + tablas)
- Cualquier módulo con lectura/escritura de datos reales

---

## ARQUITECTURA SDD (Specification-Driven Development)

```
                    ┌─────────────────────────────┐
                    │   ORCHESTRATOR (Claude)      │
                    │  Lee specs → crea ramas →    │
                    │  lanza subagentes → PRs      │
                    └──────────────┬──────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                         │
   ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
   │ AGENTE A    │          │ AGENTE B    │          │ AGENTE C    │
   │ Data layer  │          │ UI/UX       │          │ Integraciones│
   │ (Supabase + │          │ (Pages +    │          │ (Gmail +    │
   │  APIs REST) │          │  Components)│          │  Calendar + │
   └─────────────┘          └─────────────┘          │  Telegram)  │
                                                      └─────────────┘
```

**Principios SDD en este proyecto:**
1. Cada feature tiene su **spec** en `skills/skill_XX.md` (ya escritas)
2. El orchestrator lee la spec → crea rama → lanza agente especializado
3. Los agentes trabajan con: spec + contexto Engram + código existente
4. Todo código pasa por: tests → build → security audit → PR → merge
5. Agentes independientes corren **en paralelo**; los dependientes, en secuencia

---

## PLAN DE EJECUCIÓN POR STREAMS PARALELOS

### 🔴 PREREQUISITO (hacer primero, todos los streams lo necesitan)
```
[ORCHESTRATOR] Configurar Supabase en Vercel
  → Añadir env vars (SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY)
  → Ejecutar migración Prisma (prisma db push)
  → Habilitar pgvector en Supabase
  → Crear tabla profiles + RLS policies
  → Redesplegar en Vercel
```

---

### STREAM A — Núcleo de Datos (Fase 1-2) 🔄 Iniciar tras prerequisito

```
feat/skill-03-eventos          feat/skill-14-validacion
        │                               │
        └──────────── PARALELO ─────────┘
                          │
              feat/skill-09-crm   feat/skill-10-presupuestos
                          │
                     (secuencial, necesitan eventos)
```

**A1 — feat/skill-03-eventos** (Agente: data-layer)
- CRUD eventos con Supabase
- API routes: GET/POST/PUT/DELETE /api/eventos
- Listado con filtros, paginación
- Formulario crear/editar evento

**A2 — feat/skill-14-validacion** (Agente: forms, paralelo con A1)
- Schemas Zod para todos los módulos
- React Hook Form wrappers
- Componentes FormField, FormError reutilizables

**A3 — feat/skill-09-crm** (después de A1)
- CRUD clientes
- Historial de eventos por cliente
- Búsqueda y filtros

**A4 — feat/skill-10-presupuestos** (después de A1 + A3)
- Crear/editar presupuestos
- Conversión a factura
- Generación PDF

---

### STREAM B — Experiencia de Usuario (Fase 2) 🔄 Paralelo con A

```
feat/skill-15-tanstack    feat/skill-17-graficos    feat/skill-04-scrum
        │                         │                         │
        └─────────────── PARALELO ┴─────────────────────────┘
```

**B1 — feat/skill-15-tanstack** (Agente: frontend)
- TanStack Table en listados (eventos, clientes, tareas)
- TanStack Query para fetching + cache
- Sorting, filtering, pagination server-side

**B2 — feat/skill-17-graficos** (paralelo con B1)
- Dashboard home con datos reales
- Gráficos: ingresos mensuales, eventos por estado, tareas por prioridad
- Recharts + date-fns

**B3 — feat/skill-04-scrum** (paralelo con B1, B2)
- Tablero Kanban de tareas del equipo
- Drag & drop columnas (pendiente → en progreso → completada)
- Asignación de tareas por usuario

---

### STREAM C — Integraciones Externas (Fase 2) ⚠️ Requiere OAuth configurado

```
feat/skill-05-calendar    feat/skill-06-email    feat/skill-07-telegram
        │                       │                        │
        └────────── PARALELO ───┴────────────────────────┘
```

**C1 — feat/skill-05-calendar** (Agente: integrations)
- Google Calendar OAuth
- Ver eventos del calendario en dashboard
- Crear/editar eventos desde el dashboard

**C2 — feat/skill-06-email** (Agente: integrations, paralelo con C1)
- Gmail API: bandeja entrada, enviados, redactar, responder
- Bot DeepSeek asistente de redacción
- Resumen de hilos, sugerencias de respuesta

**C3 — feat/skill-07-telegram** (paralelo con C1, C2)
- Bot de notificaciones de eventos
- Comandos: /eventos, /tareas, /resumen

---

### STREAM D — Finanzas y Documentos (Fase 3) ⏳ Después de Stream A

```
feat/skill-08-contabilidad    feat/skill-18-storage
        │                             │
        └────────── PARALELO ─────────┘
```

**D1 — feat/skill-08-contabilidad** (Agente: finance)
- Registro de movimientos (ingresos/gastos)
- OCR de facturas (Google Vision API)
- Balance, P&L mensual

**D2 — feat/skill-18-storage** (paralelo con D1)
- Supabase Storage para fotos de eventos
- Uploadthing para documentos/PDFs
- Preview de imágenes

---

### STREAM E — IA y Automatización (Fase 4-5) ⏳ Después de todo lo anterior

```
feat/skill-12-rag    feat/skill-19-async    feat/skill-16-observabilidad
        │                   │                          │
        └──── PARALELO ──────┴──────────────────────────┘
```

**E1 — feat/skill-12-rag** (Agente: ai)
- pgvector en Supabase para embeddings
- DeepSeek API para chat + RAG
- Base de conocimiento de la empresa

**E2 — feat/skill-19-async** (paralelo con E1)
- Redis + BullMQ para colas
- Notificaciones programadas
- Generación de informes asíncronos

**E3 — feat/skill-16-observabilidad** (paralelo con E1, E2)
- Sentry configurado (v10 ya instalado)
- PostHog analytics
- Dashboard de errores y uso

---

## DIAGRAMA DE DEPENDENCIAS

```
PREREQUISITO (Supabase)
        │
        ▼
   ┌────┴────────────────────────────────────────────────────┐
   │                                                          │
   ▼                                                          ▼
STREAM A                                                  STREAM B
(skill-03, 14)                                       (skill-15, 17, 04)
   │                                                          │
   ▼                                                          ▼
(skill-09, 10)                                        (merge a main)
   │
   ▼
STREAM D (skill-08, 18)
   │
   ▼
STREAM E (skill-12, 19, 16)

STREAM C (skill-05, 06, 07) ←── Paralelo con A+B, requiere OAuth Google
```

---

## WORKFLOW POR FEATURE (protocolo de cada agente)

```bash
# 1. Sincronizar con main
git checkout main && git pull origin main

# 2. Crear rama
git checkout -b feat/skill-XX-nombre

# 3. Desarrollar (leer spec en skills/skill_XX.md + contexto Engram)

# 4. Verificar antes de commit
npm run lint && npm run type-check && npm test && npm run build

# 5. Commit semántico
git commit -m "feat(módulo): descripción concisa"

# 6. Push + PR
git push origin feat/skill-XX-nombre
# Abrir PR en: https://github.com/jralmiron/dashboard-empresarial/compare

# 7. Merge a main tras review
```

---

## PRÓXIMAS ACCIONES INMEDIATAS

| Prioridad | Acción | Responsable |
|---|---|---|
| 🔴 URGENTE | Pasar credenciales Supabase para configurar env vars | Usuario |
| 🔴 URGENTE | Mergear PR `feat/testing-and-security-audit` | Usuario (revisar PR) |
| 🟠 ALTA | Ejecutar migración Prisma en Supabase | Orchestrator (tras credenciales) |
| 🟠 ALTA | Lanzar Stream A+B en paralelo | Orchestrator (tras Supabase) |
| 🟡 MEDIA | Configurar OAuth Google (Calendar + Gmail) | Usuario (panel Google Cloud) |
| 🟡 MEDIA | Crear bot Telegram | Usuario (BotFather) |

---

## NOTAS DE SESIÓN (actualizar en cada sesión)

### 2026-03-12
- ✅ Setup inicial completado (commit: ec0d1be)
- ✅ Groq AI client + brand palette (commits: e3591e5, 3a6cf7e, 3eff41d)
- ✅ Auth + Dashboard layout + UI components (commit: 609dec7)
- ✅ Testing + Security + GitHub Actions (rama: feat/testing-and-security-audit)
- ✅ 7 memorias guardadas en Engram
- ⏳ Esperando: credenciales Supabase + merge de PR abierto
