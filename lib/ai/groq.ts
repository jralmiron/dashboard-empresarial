/**
 * Cliente Groq — IA en producción (gratis)
 * API compatible con OpenAI — https://console.groq.com/docs
 *
 * Modelos disponibles:
 *   RÁPIDO:   llama-3.1-8b-instant     (~600 tokens/s, ideal para respuestas cortas)
 *   POTENTE:  llama-3.3-70b-versatile  (~240 tokens/s, mejor calidad)
 *   CÓDIGO:   llama3-70b-8192          (ideal para generación de código)
 *   CHAT:     mixtral-8x7b-32768       (contexto largo 32k tokens)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1'

export const GROQ_MODELS = {
  fast: 'llama-3.1-8b-instant',       // respuestas rápidas, tareas simples
  smart: 'llama-3.3-70b-versatile',   // razonamiento, análisis, resúmenes
  code: 'llama3-70b-8192',            // generación y revisión de código
  longContext: 'mixtral-8x7b-32768',  // documentos largos, contexto 32k
} as const

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS]

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqChatOptions {
  model?: GroqModel
  messages: ChatMessage[]
  temperature?: number   // 0 = determinista, 1 = creativo (default: 0.7)
  maxTokens?: number     // default: 1024
  stream?: boolean
}

export interface GroqChatResponse {
  id: string
  model: string
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Llama al API de Groq con una conversación.
 * Usar en Server Components, API Routes o Server Actions.
 * NUNCA llamar desde el cliente (expone la API key).
 */
export async function groqChat(options: GroqChatOptions): Promise<GroqChatResponse> {
  const {
    model = GROQ_MODELS.smart,
    messages,
    temperature = 0.7,
    maxTokens = 1024,
  } = options

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada')

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Groq API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const choice = data.choices[0]

  return {
    id: data.id,
    model: data.model,
    content: choice.message.content,
    usage: {
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      totalTokens: data.usage.total_tokens,
    },
  }
}

/**
 * Versión simplificada para una sola pregunta/respuesta.
 */
export async function groqAsk(
  prompt: string,
  systemPrompt?: string,
  model: GroqModel = GROQ_MODELS.fast
): Promise<string> {
  const messages: ChatMessage[] = []

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt })
  }
  messages.push({ role: 'user', content: prompt })

  const response = await groqChat({ model, messages })
  return response.content
}

/**
 * Streaming — para respuestas en tiempo real en la UI.
 * Usar en API route con ReadableStream.
 */
export async function groqStream(options: GroqChatOptions): Promise<ReadableStream> {
  const {
    model = GROQ_MODELS.smart,
    messages,
    temperature = 0.7,
    maxTokens = 2048,
  } = options

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada')

  const response = await fetch(`${GROQ_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  })

  if (!response.ok) throw new Error(`Groq stream error: ${response.status}`)
  if (!response.body) throw new Error('No stream body')

  return response.body
}
