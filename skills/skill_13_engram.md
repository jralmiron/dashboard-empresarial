# SKILL 13 — Engram: Memoria Persistente del Proyecto
## Transversal | Sub-agente: Memory Agent

---

## OBJETIVO
Engram proporciona memoria persistente entre sesiones para todos los agentes del proyecto.
Cada sub-agente guarda sus decisiones, aprendizajes y estado en SQLite local mediante MCP.
El Master Agent recupera el contexto de sesiones anteriores antes de empezar a trabajar.

---

## QUÉ ES ENGRAM

```
Agente (Claude Code) → MCP stdio → Engram (binario Go) → SQLite + FTS5
                                         ↓
                                 ~/.engram/engram.db
```

- **Sin dependencias externas** — SQLite local, un solo binario
- **Búsqueda full-text** — FTS5 nativo para recuperar contexto relevante
- **13 herramientas MCP** — guardar, buscar, actualizar, timelines
- **Deduplicación inteligente** — `topic_key` actúa como upsert

---

## INSTALACIÓN EN WINDOWS

### Opción A: Descargar binario (recomendado)
```
1. Ir a: https://github.com/Gentleman-Programming/engram/releases
2. Descargar: engram_windows_amd64.zip
3. Extraer engram.exe
4. Mover a: C:\Users\jr_al\AppData\Local\engram\engram.exe
5. Añadir al PATH del sistema: C:\Users\jr_al\AppData\Local\engram\
```

### Opción B: Compilar desde fuente (requiere Go)
```bash
git clone https://github.com/Gentleman-Programming/engram.git
cd engram
go install ./cmd/engram
```

### Verificar instalación
```bash
engram --version
engram mcp  # Debe iniciar el servidor MCP
```

---

## CONFIGURACIÓN EN CLAUDE CODE

Añadir a `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "engram": {
      "command": "engram",
      "args": ["mcp"]
    }
  }
}
```

---

## LAS 13 HERRAMIENTAS DISPONIBLES

| Herramienta | Cuándo usarla |
|---|---|
| `mem_save` | Guardar decisión, aprendizaje o progreso importante |
| `mem_update` | Actualizar memoria existente por topic_key |
| `mem_delete` | Eliminar memoria obsoleta o incorrecta |
| `mem_search` | Buscar contexto por texto libre |
| `mem_context` | Obtener contexto de sesiones previas al iniciar |
| `mem_session_summary` | Guardar resumen al finalizar una sesión |
| `mem_timeline` | Ver evolución cronológica de un tema |
| `mem_get_observation` | Obtener observación completa por ID |
| `mem_save_prompt` | Guardar prompts útiles reutilizables |
| `mem_stats` | Ver estadísticas de la base de conocimiento |
| `mem_session_start` | Registrar inicio de sesión de trabajo |
| `mem_session_end` | Registrar fin de sesión con resumen |
| `mem_suggest_topic_key` | Sugerir clave estable para un tema |

---

## PROTOCOLO DE USO POR SUB-AGENTE

### Al INICIAR una sesión de trabajo
```
1. mem_context → recuperar contexto del proyecto
2. mem_search "dashboard_empresarial" → ver estado previo
3. mem_search "skill_0X_nombre" → ver estado del módulo específico
```

### Durante el TRABAJO
```
// Al tomar una decisión de arquitectura importante
mem_save {
  title: "Decisión: usar pgvector en Supabase para RAG",
  type: "architecture",
  topic_key: "architecture/rag-vector-db",
  content: "
    What: Usamos pgvector extensión de Supabase en lugar de Pinecone/Chroma
    Why: Ya tenemos Supabase, sin coste extra, suficiente para escala inicial
    Where: skill_12_rag.md, lib/rag/query.ts
    Learned: pgvector con índice HNSW tiene latencia < 50ms en búsquedas
  "
}

// Al completar una tarea
mem_save {
  title: "skill_01_auth completado",
  type: "progress",
  topic_key: "progress/skill-01-auth",
  content: "
    What: Auth con Supabase implementado
    Where: app/(auth)/login, middleware.ts, lib/supabase/
    Estado: ✅ Login/logout OK, RLS configurado, roles admin/empleado funcionando
    Pendiente: OAuth Google para Calendar/Gmail (Fase 2)
  "
}
```

### Al FINALIZAR la sesión
```
mem_session_summary {
  resumen: "Implementado skill_01_auth y skill_02_dashboard.
            Auth funcional con roles. Dashboard con KPIs básicos.
            Próximo: skill_03_eventos",
  completado: ["skill_01_auth", "skill_02_dashboard"],
  bloqueadores: [],
  proximos_pasos: ["skill_03_eventos", "seed de datos en Supabase"]
}
```

---

## TOPIC_KEYS ESTÁNDAR DEL PROYECTO

Usar siempre estos topic_keys para que los agentes se entiendan entre sesiones:

```
# Estado de módulos
progress/skill-01-auth
progress/skill-02-dashboard
progress/skill-03-eventos
progress/skill-04-scrum
progress/skill-05-calendar
progress/skill-06-email
progress/skill-07-telegram
progress/skill-08-contabilidad
progress/skill-09-crm
progress/skill-10-presupuestos
progress/skill-11-ia-local
progress/skill-12-rag

# Decisiones de arquitectura
architecture/database-schema
architecture/auth-strategy
architecture/rag-vector-db
architecture/ia-model-selection
architecture/deployment

# Bugs conocidos
bug/supabase-rls-issue
bug/oauth-google-redirect

# Aprendizajes del proyecto
learned/supabase-realtime-setup
learned/ollama-windows-config
learned/nextjs-app-router-patterns

# Configuración del entorno
env/supabase-project-id
env/vercel-project-id
env/ollama-model-config
```

---

## RECUPERACIÓN PROGRESIVA (3 niveles)

```
Nivel 1 — Búsqueda rápida (IDs):
  mem_search "auth middleware" → resultados compactos

Nivel 2 — Contexto temporal:
  mem_timeline observation_id=42 → qué pasó antes y después

Nivel 3 — Contenido completo:
  mem_get_observation id=42 → observación sin truncar
```

---

## TIPOS DE MEMORIA RECOMENDADOS

| Tipo | Cuándo usar |
|---|---|
| `architecture` | Decisiones de diseño y estructura |
| `progress` | Estado completado de cada skill/módulo |
| `bugfix` | Problemas encontrados y cómo se resolvieron |
| `decision` | Elecciones entre alternativas con justificación |
| `learned` | Patrones y trucos descubiertos |
| `config` | Configuraciones de entorno y herramientas |
| `blocker` | Problemas sin resolver aún |
| `prompt` | Prompts útiles para invocar sub-agentes |

---

## INSTRUCCIÓN PARA EL MASTER AGENT

```
Al inicio de CADA sesión del proyecto dashboard_empresarial:

1. mem_context → contexto general
2. mem_search "dashboard_empresarial progress" → ver qué está hecho
3. mem_search "blocker" → ver problemas pendientes
4. Informar al usuario: "Según memoria, el último estado era: [X]"
5. Preguntar: "¿Continuamos desde skill_0X o hay cambios de plan?"

Al finalizar CADA sesión:
1. mem_session_summary con resumen de lo trabajado
2. mem_update en los topic_keys de los módulos tocados
3. Si surgió algo inesperado → mem_save type="learned"
```

---

## SCOPE DEL PROYECTO

Guardar todas las memorias de este proyecto con scope:
```
scope: "project"
project: "dashboard_empresarial"
```

Esto permite filtrar memorias por proyecto y no mezclar con otros proyectos futuros.

---

## OUTPUT ESPERADO
- Persistencia total de estado entre sesiones de trabajo
- Cada sub-agente arranca con contexto de lo que hicieron los anteriores
- Historial de decisiones de arquitectura consultable
- Bugs y aprendizajes acumulados y buscables
- El Master Agent puede resumir el estado del proyecto en cualquier momento

## CRITERIOS DE ACEPTACIÓN
- [ ] Engram instalado y `engram mcp` responde
- [ ] MCP configurado en ~/.claude/settings.json
- [ ] Al iniciar sesión, mem_context devuelve contexto del proyecto
- [ ] Cada skill completado guarda su estado con topic_key estándar
- [ ] mem_search "dashboard_empresarial" devuelve historial completo
