# SKILL 11 — Módulo de IA Local
## Fase 4 | Sub-agente: IA Agent

---

## OBJETIVO
Integrar un modelo de IA ligero ejecutándose en local (Ollama) para gestionar y asistir en todas las funciones del dashboard: consultas en lenguaje natural, resúmenes automáticos, sugerencias inteligentes y control por voz/texto del sistema.

## MODELO RECOMENDADO

### Opción Principal: Ollama + Llama 3.2 (3B)
```bash
# Instalar Ollama
# https://ollama.com/download

# Descargar modelo ligero (1.9GB RAM)
ollama pull llama3.2:3b

# Alternativas según hardware disponible:
ollama pull qwen2.5:3b       # Muy rápido, multilingüe, excelente en español
ollama pull phi3.5:mini      # Microsoft, 3.8B, muy bueno en tareas de razonamiento
ollama pull gemma2:2b        # Google, 2B, rápido y preciso
ollama pull mistral:7b       # 7B, más capaz si tienes 8GB RAM libres
```

### Requisitos Mínimos
| Modelo | RAM | Velocidad | Calidad |
|---|---|---|---|
| qwen2.5:3b | 2GB | ⚡⚡⚡ | ★★★ |
| llama3.2:3b | 2GB | ⚡⚡⚡ | ★★★ |
| phi3.5:mini | 2.5GB | ⚡⚡⚡ | ★★★★ |
| mistral:7b | 5GB | ⚡⚡ | ★★★★★ |

**Recomendación: `qwen2.5:3b`** — mejor rendimiento en español, rápido y ligero.

---

## ARQUITECTURA

```
Dashboard (Next.js)
       ↓
API Route /api/ia/*
       ↓
Ollama Server (localhost:11434)
       ↓
Modelo local (qwen2.5:3b)
       ↓
Contexto del usuario (Supabase)
```

---

## FUNCIONALIDADES

### 1. Asistente de Chat Global
- Widget flotante en todas las páginas del dashboard
- El usuario escribe en lenguaje natural: *"¿Cuánto he ganado este mes?"*
- La IA consulta los datos reales del usuario en Supabase
- Responde en español con datos precisos

### 2. Gestión por Comandos en Lenguaje Natural
```
"Crea una tarea urgente para María: confirmar catering boda García"
"Muestra los eventos de la próxima semana"
"¿Cuántas facturas pendientes de cobro tengo?"
"Asigna la tarea 'diseño invitaciones' a Pedro con fecha límite viernes"
"Genera un resumen del evento Boda Martínez"
```

### 3. Resúmenes Automáticos Inteligentes
- Resumen diario del dashboard al entrar
- Resumen de un evento completo (equipo, tareas, gastos)
- Informe automático de contabilidad mensual en texto
- Briefing del equipo para el día

### 4. Sugerencias Proactivas
- *"Tienes 3 facturas vencidas, ¿quieres que redacte el recordatorio?"*
- *"El evento Boda García es en 5 días y hay 2 tareas sin completar"*
- *"El gasto en catering este mes supera el presupuesto en un 15%"*

### 5. OCR Asistido con IA
- Tras extraer el texto del ticket con OCR, la IA interpreta y clasifica
- Detecta si es gasto o ingreso automáticamente
- Sugiere categoría del gasto
- Detecta si el proveedor ya existe en la base de datos

### 6. Redacción Asistida
- Ayudar a redactar emails a clientes
- Generar cuerpo de presupuesto con descripción profesional
- Sugerir condiciones y cláusulas para contratos
- Redactar respuestas a emails recibidos

### 7. Análisis de Contabilidad
- *"¿En qué estoy gastando más este trimestre?"*
- *"Compara el beneficio de bodas vs eventos corporativos"*
- *"Proyecta la facturación del próximo mes basándote en los eventos confirmados"*

---

## IMPLEMENTACIÓN TÉCNICA

### Configuración Ollama
```typescript
// lib/ia/ollama.ts
const OLLAMA_BASE_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const DEFAULT_MODEL = process.env.IA_MODEL ?? 'qwen2.5:3b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function chatWithIA(
  messages: ChatMessage[],
  stream = false
): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      stream,
      options: {
        temperature: 0.3,      // Más preciso para tareas de gestión
        num_ctx: 4096,         // Contexto suficiente
        num_predict: 512       // Respuestas concisas
      }
    })
  })

  const data = await response.json()
  return data.message.content
}

// Streaming para respuestas largas
export async function* streamChatWithIA(
  messages: ChatMessage[]
): AsyncGenerator<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({ model: DEFAULT_MODEL, messages, stream: true })
  })

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = JSON.parse(decoder.decode(value))
    if (chunk.message?.content) yield chunk.message.content
  }
}
```

### Sistema de Prompts con Contexto del Usuario
```typescript
// lib/ia/prompts.ts
export async function buildSystemPrompt(userId: string): Promise<string> {
  // Cargar contexto real del usuario desde Supabase
  const { eventos, tareas, balance } = await getUserContext(userId)

  return `Eres un asistente de gestión de eventos para una empresa profesional.
Responde siempre en español, de forma concisa y directa.

CONTEXTO ACTUAL DEL USUARIO:
- Fecha de hoy: ${new Date().toLocaleDateString('es-ES')}
- Eventos próximos (7 días): ${eventos.proximos.length}
- Tareas pendientes: ${tareas.pendientes}
- Balance del mes: ${balance.neto > 0 ? '+' : ''}${balance.neto}€

EVENTOS PRÓXIMOS:
${eventos.proximos.map(e => `- ${e.nombre} (${e.fecha}): ${e.estado}`).join('\n')}

TAREAS URGENTES SIN COMPLETAR:
${tareas.urgentes.map(t => `- ${t.titulo} → ${t.asignado}`).join('\n')}

CAPACIDADES QUE TIENES:
- Crear tareas: usa [ACTION:CREATE_TASK:{json}]
- Asignar tareas: usa [ACTION:ASSIGN_TASK:{id}:{empleado_id}]
- Cambiar estado evento: usa [ACTION:UPDATE_EVENTO:{id}:{estado}]
- Navegar a sección: usa [ACTION:NAVIGATE:{ruta}]

Cuando ejecutes una acción, explica brevemente lo que hiciste.`
}
```

### Parser de Acciones (IA → Dashboard)
```typescript
// lib/ia/actionParser.ts
interface IAAction {
  type: 'CREATE_TASK' | 'ASSIGN_TASK' | 'UPDATE_EVENTO' | 'NAVIGATE'
  payload: Record<string, unknown>
}

export function parseIAActions(response: string): {
  text: string
  actions: IAAction[]
} {
  const actionRegex = /\[ACTION:(\w+):([^\]]+)\]/g
  const actions: IAAction[] = []

  const text = response.replace(actionRegex, (_, type, payloadStr) => {
    try {
      actions.push({ type, payload: JSON.parse(payloadStr) })
    } catch {
      actions.push({ type, payload: { raw: payloadStr } })
    }
    return '' // Eliminar del texto mostrado
  })

  return { text: text.trim(), actions }
}
```

### API Routes del Módulo IA
```typescript
// app/api/ia/chat/route.ts
POST /api/ia/chat
Body: { message: string, history: ChatMessage[] }
Response: { reply: string, actions: IAAction[] }

// app/api/ia/stream/route.ts
POST /api/ia/stream
Body: { message: string, history: ChatMessage[] }
Response: ReadableStream (Server-Sent Events)

// app/api/ia/resumen/route.ts
GET /api/ia/resumen
Response: { resumen: string }  // Resumen del día

// app/api/ia/ocr-classify/route.ts
POST /api/ia/ocr-classify
Body: { ocr_text: string }
Response: { categoria: string, tipo: 'ingreso'|'gasto', confianza: number }

// app/api/ia/redactar/route.ts
POST /api/ia/redactar
Body: { tipo: 'email'|'presupuesto', contexto: Record<string, unknown> }
Response: { texto: string }
```

---

## PÁGINAS Y COMPONENTES

### Widget de Chat Flotante (global)
```typescript
// components/ia/IAChat.tsx
// Botón flotante en esquina inferior derecha
// Al hacer click: abre panel lateral o modal
// Historial de conversación persistido en localStorage
// Indicador de "IA escribiendo..." mientras procesa
// Acciones ejecutadas visibles como chips/badges

<IAChat
  position="bottom-right"
  placeholder="Pregúntame algo sobre tu negocio..."
  streamResponse={true}
/>
```

### Panel de IA en el Dashboard Home
```typescript
// Widget en el dashboard principal
// "Buenos días, Juan. Hoy tienes 2 eventos y 5 tareas pendientes."
// Sugerencias del día (3 máx)
// Botón para abrir chat completo
```

### Asistente en Formularios
```typescript
// Botón "✨ Ayuda con IA" en:
// - Formulario de email → "Generar borrador"
// - Formulario de presupuesto → "Sugerir descripción"
// - Ficha de evento → "Generar resumen del evento"
// - OCR form → "Clasificar automáticamente"
```

---

## CONFIGURACIÓN DEL ENTORNO

### Variables de Entorno
```env
OLLAMA_URL=http://localhost:11434
IA_MODEL=qwen2.5:3b
IA_ENABLED=true
IA_MAX_TOKENS=512
IA_TEMPERATURE=0.3
```

### Modo Producción (sin Ollama local)
Si el dashboard se despliega en Vercel (sin acceso a Ollama local), usar como fallback la API de Claude (claude-haiku-4-5) que es muy económica:

```typescript
// lib/ia/provider.ts
export async function getIAProvider() {
  if (process.env.IA_ENABLED === 'true') {
    // Intentar Ollama local primero
    const isOllamaAvailable = await checkOllamaHealth()
    if (isOllamaAvailable) return 'ollama'
  }
  // Fallback: Claude Haiku (barato)
  return 'claude-haiku'
}
```

```env
# Fallback para producción
ANTHROPIC_API_KEY=
IA_FALLBACK_MODEL=claude-haiku-4-5-20251001
```

---

## ESQUEMA DE BASE DE DATOS

```sql
CREATE TABLE ia_conversaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mensajes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ia_acciones_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES profiles(id),
  tipo_accion TEXT NOT NULL,
  payload JSONB,
  resultado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: cada usuario solo ve sus conversaciones
ALTER TABLE ia_conversaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ia_own_conversations"
  ON ia_conversaciones FOR ALL
  USING (usuario_id = auth.uid());
```

---

## DEPENDENCIAS A INSTALAR

```bash
# No necesita SDK pesado — Ollama tiene API REST nativa
# Solo para streaming y utilidades:
npm install ai                    # Vercel AI SDK (streaming helpers)
npm install @anthropic-ai/sdk     # Solo si usas fallback Claude
```

---

## SETUP INICIAL (guía para el usuario)

```bash
# 1. Instalar Ollama en Windows
# Descargar desde: https://ollama.com/download/windows

# 2. Descargar el modelo recomendado
ollama pull qwen2.5:3b

# 3. Verificar que funciona
ollama run qwen2.5:3b "Hola, responde en español"

# 4. Ollama se ejecuta automáticamente en localhost:11434
# No necesita estar abierto, corre como servicio en background

# 5. Añadir variable de entorno
echo "OLLAMA_URL=http://localhost:11434" >> .env.local
echo "IA_MODEL=qwen2.5:3b" >> .env.local
```

---

## OUTPUT ESPERADO
- Widget de chat flotante en todo el dashboard
- IA con contexto real del usuario (eventos, tareas, balance)
- Ejecución de acciones desde lenguaje natural
- Clasificación automática de tickets OCR con IA
- Asistente de redacción en formularios clave
- Fallback a Claude Haiku si Ollama no está disponible

## CRITERIOS DE ACEPTACIÓN
- [ ] Chat responde en menos de 3 segundos con qwen2.5:3b
- [ ] La IA conoce el contexto real del usuario (eventos, tareas)
- [ ] Comando "crea una tarea" ejecuta la acción en el sistema
- [ ] OCR clasifica correctamente el 80%+ de los tickets
- [ ] Widget flotante disponible en todas las páginas
- [ ] Fallback a Claude Haiku si Ollama no responde
- [ ] Historial de conversación persiste entre sesiones
- [ ] Modo streaming: respuesta aparece progresivamente
