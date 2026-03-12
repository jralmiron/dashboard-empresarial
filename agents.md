# MASTER AGENT — Dashboard Empresarial de Gestión de Eventos
## Biblioteca de Skills y Orquestación

---

## ROL DEL MASTER AGENT

El Master Agent coordina todos los sub-agentes. Lee este archivo para entender el proyecto completo, distribuye tareas a los skills correspondientes y sincroniza los resultados. Antes de ejecutar cualquier skill, consulta el estado actual en `status.md`.

---

## REGLAS DE ORQUESTACIÓN

1. **Leer primero** — Todo agente debe leer su skill file antes de escribir código
2. **No duplicar** — Si un módulo ya está implementado, no reescribirlo
3. **Dependencias** — Respetar el orden de fases: Fase 1 antes que Fase 2, etc.
4. **Estándares** — Todo código debe pasar por `skill_quality.md` antes de entregarse
5. **Seguridad** — Aplicar `skill_security.md` en cualquier endpoint, auth o formulario
6. **Diseño** — Aplicar `skill_design.md` en cualquier componente visual nuevo
7. **Comunicación** — Cada sub-agente reporta su output en formato: `[SKILL_NAME] ✓ tarea completada`

---

## SKILLS DISPONIBLES

### Skills de Módulos (Fases del Proyecto)
| Archivo | Módulo | Fase |
|---|---|---|
| `skill_01_auth.md` | Autenticación y Roles | 1 |
| `skill_02_dashboard.md` | Panel de Control Home | 1 |
| `skill_03_eventos.md` | Gestión de Eventos | 1 |
| `skill_04_scrum.md` | Tablero Scrum del Equipo | 1 |
| `skill_05_calendar.md` | Google Calendar | 2 |
| `skill_06_email.md` | Gmail Integrado | 2 |
| `skill_07_telegram.md` | Bot de Telegram | 2 |
| `skill_08_contabilidad.md` | Contabilidad + OCR | 3 |
| `skill_09_crm.md` | CRM de Clientes | 3 |
| `skill_10_presupuestos.md` | Presupuestos y Facturación | 3 |
| `skill_11_ia_local.md` | IA Local (Ollama) | 4 |
| `skill_12_rag.md` | RAG Base de Conocimiento | 4 |
| `skill_13_engram.md` | Memoria Persistente (Engram) | Transversal |

### Skills Nuevos — Arquitectura Profesional (del informe técnico)
| Archivo | Módulo | Fase |
|---|---|---|
| `skill_14_validacion.md` | Zod + React Hook Form | 1 |
| `skill_15_tanstack.md` | TanStack Query + TanStack Table | 2 |
| `skill_16_observabilidad.md` | Sentry + PostHog | 3 |
| `skill_17_graficos.md` | Recharts + date-fns | 2 |
| `skill_18_storage.md` | Supabase Storage + Uploadthing | 2 |
| `skill_19_async.md` | Redis + BullMQ (colas asíncronas) | 4 |

### Skills de Calidad (Transversales — aplicar siempre)
| Archivo | Propósito |
|---|---|
| `skill_quality.md` | ESLint + Prettier + Husky + lint-staged |
| `skill_security.md` | Seguridad y protección de datos |
| `skill_frontend.md` | Frontend moderno y accesible |
| `skill_design.md` | Sistema de diseño y UI/UX |
| `skill_testing.md` | Vitest (unit) + Playwright (e2e) |
| `skill_performance.md` | Rendimiento y optimización |
| `skill_database.md` | PostgreSQL + RLS + soft delete + auditoría |
| `skill_api.md` | Diseño de APIs REST/GraphQL |
| `skill_devops.md` | CI/CD GitHub Actions + Vercel |
| `skill_accessibility.md` | Accesibilidad WCAG |

---

## STACK TECNOLÓGICO

```
Frontend:    Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
Formularios: React Hook Form + Zod
Estado:      TanStack Query + TanStack Table
Gráficos:    Recharts + date-fns
Backend:     Next.js API Routes + Supabase
Database:    PostgreSQL (Supabase) + Prisma ORM + RLS + soft delete
Auth:        Supabase Auth (email/password + OAuth)
Storage:     Supabase Storage + Uploadthing
Realtime:    Supabase Realtime (notificaciones en vivo)
Deploy:      Vercel (frontend) + Supabase (backend)
CI/CD:       GitHub Actions + ESLint + Prettier + Husky
Testing:     Vitest (unit) + Playwright (e2e)
Errores:     Sentry
Analíticas:  PostHog
Colas:       Redis + BullMQ (Fase 4)
OCR:         Google Vision API
Calendar:    Google Calendar API
Email:       Gmail API
Bot:         Telegram Bot API
IA local:    Ollama + FastAPI/NestJS (desacoplado, Fase 5)
RAG:         pgvector + Engram
```

---

## ESTRUCTURA DE CARPETAS DEL PROYECTO

```
dashboard_empresarial/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── home/
│   │   ├── eventos/
│   │   ├── scrum/
│   │   ├── calendario/
│   │   ├── email/
│   │   ├── contabilidad/
│   │   ├── clientes/
│   │   └── presupuestos/
│   └── api/
│       ├── auth/
│       ├── eventos/
│       ├── tareas/
│       ├── contabilidad/
│       └── telegram/
├── components/
│   ├── ui/          (shadcn)
│   ├── layout/
│   └── modules/
├── lib/
│   ├── supabase/
│   ├── google/
│   └── telegram/
├── prisma/
│   └── schema.prisma
└── skills/          (este directorio)
```

---

## CÓMO INVOCAR UN SKILL

```
Agente, ejecuta el skill: skill_04_scrum.md
Contexto del proyecto: agents.md
Restricciones: aplicar skill_security.md y skill_design.md
Output esperado: componentes React + API routes + schema DB
```

---

## ESTADO DEL PROYECTO

Ver archivo `status.md` para el estado actualizado de cada módulo.
