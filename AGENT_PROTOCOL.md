# AGENT PROTOCOL — Token Optimization
## Protocolo de comunicación Master ↔ Sub-Agents

---

## PRINCIPIO FUNDAMENTAL

> Cada sub-agent recibe SOLO lo que necesita para su tarea. Nada más.

---

## ESTRUCTURA DE INVOCACIÓN (Master → Sub-Agent)

El master agent siempre invoca un sub-agent con este bloque mínimo:

```
SKILL: skill_XX_nombre.md
TASK: [una línea — qué crear/modificar]
FILES: [lista de archivos afectados]
DEPS: [skills ya completados de los que depende]
SKIP: [qué NO hacer — evita trabajo duplicado]
```

### Ejemplo real
```
SKILL: skill_01_auth.md
TASK: Crear login page + API route + Supabase Auth integration
FILES: app/(auth)/login/page.tsx, app/api/auth/route.ts, lib/supabase/server.ts
DEPS: skill_14_validacion (Zod schemas disponibles en lib/validations/auth.ts)
SKIP: No crear middleware (ya existe), no tocar layout.tsx
```

---

## ESTRUCTURA DE RESPUESTA (Sub-Agent → Master)

Cada sub-agent responde en formato compacto:

```
[SKILL_XX] ✓ COMPLETADO
CREATED: archivo1.ts, archivo2.tsx
MODIFIED: archivo3.ts
EXPORTS: NombreComponente, nombreFuncion (para que otros skills lo importen)
NEXT: skill que debe ejecutarse después (si hay dependencia)
ISSUES: (solo si hay bloqueadores — omitir si todo OK)
```

---

## REGLAS DE EFICIENCIA

### Para el Master Agent
1. **Un skill a la vez** si hay dependencias — no paralelizar si B depende de A
2. **Paralelizar** skills sin dependencias mutuas (ej: skill_17 y skill_18 son independientes)
3. **No re-leer** agents.md en cada invocación — leerlo solo al inicio de sesión
4. **Estado en status.md** — actualizar solo el campo `Estado` de la fila correspondiente
5. **Contexto mínimo** — pasar a sub-agents solo los EXPORTS de los skills previos relevantes

### Para Sub-Agents
1. **Leer solo** su skill file + los archivos listados en FILES
2. **No explorar** el proyecto completo — confiar en lo que el master indica
3. **No añadir** features no pedidas en TASK
4. **No comentar** código evidente — solo comentar lógica no obvia
5. **Responder en formato compacto** — seguir el bloque de respuesta de arriba

---

## MAPA DE DEPENDENCIAS (para paralelización)

```
Fase 1 — Secuencial (dependencias en cadena):
  skill_14_validacion → skill_01_auth → skill_02_dashboard
                                      → skill_03_eventos
                                      → skill_04_scrum

Fase 2 — Paralelos entre sí (sin dependencias mutuas):
  skill_15_tanstack  ──┐
  skill_17_graficos  ──┤→ (todos dependen de Fase 1)
  skill_18_storage   ──┤
  skill_05_calendar  ──┘

Fase 3 — Paralelos:
  skill_08_contabilidad ──┐
  skill_09_crm          ──┤→ (dependen de Fase 2)
  skill_10_presupuestos ──┘
  skill_16_observabilidad → (independiente, puede ir antes)

Fase 4 — skill_19_async (solo cuando Fase 2-3 estén estables)

Fase 5 — skill_11, skill_12, skill_13 (al final)
```

---

## LECTURA DE ARCHIVOS — POLÍTICA

| Archivo | Quién lo lee | Cuándo |
|---|---|---|
| `AGENT_PROTOCOL.md` | Master + todos los sub-agents | Al inicio de cada sesión (1 vez) |
| `agents.md` | Solo Master Agent | Al inicio de sesión |
| `status.md` | Solo Master Agent | Para decidir qué ejecutar |
| `skill_XX.md` | Solo el sub-agent asignado | Justo antes de ejecutar |
| `lib/validations/*.ts` | Sub-agents que crean forms | Solo los archivos relevantes |
| `prisma/schema.prisma` | Sub-agents de BD | Solo cuando crean migraciones |

---

## TOKENS ESTIMADOS POR SKILL (orientativo)

| Tipo | Tokens aprox. | Optimización |
|---|---|---|
| Skill simple (1 componente) | ~2k-4k | Sin cambios |
| Skill medio (CRUD completo) | ~6k-10k | Dividir en 2 sub-tasks |
| Skill complejo (módulo entero) | ~15k-25k | Dividir en 3+ sub-tasks |

> Regla: Si un skill genera >15 archivos, dividirlo en sub-tasks de schema → API → UI

---

## TEMPLATE INVOCACIÓN MASTER (copiar y completar)

```
Eres un sub-agent especializado. Lee SOLO tu skill file y los archivos indicados.

SKILL: [skill_XX_nombre.md]
TASK: [descripción en una línea]
FILES_TO_CREATE: [lista]
FILES_TO_READ: [lista — solo estos, no explorar más]
DEPS_AVAILABLE: [exports de skills previos]
SKIP: [qué no hacer]
STACK: Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui + Supabase
OUTPUT: código listo para producción, sin TODOs, sin placeholders
```
