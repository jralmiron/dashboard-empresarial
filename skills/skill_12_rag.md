# SKILL 12 — RAG (Base de Conocimiento Empresarial)
## Fase 4 | Sub-agente: RAG Agent

---

## OBJETIVO
Sistema tipo NotebookLM para subir documentos de la empresa (contratos, procesos, presupuestos anteriores, guías internas) y que la IA pueda consultarlos en tiempo real. Incluye panel de gestión para añadir, actualizar y organizar documentos.

---

## ARQUITECTURA RAG

```
                    ┌─────────────────────────────┐
                    │     PIPELINE DE INGESTIÓN    │
                    │                              │
  Documento PDF/   →│  1. Extraer texto (OCR/parse)│
  DOCX/TXT/IMG     →│  2. Dividir en chunks        │
                    │  3. Generar embeddings        │→  Supabase pgvector
                    │  4. Guardar en vector DB      │
                    └─────────────────────────────┘

                    ┌─────────────────────────────┐
                    │     PIPELINE DE CONSULTA     │
                    │                              │
  Pregunta usuario →│  1. Embedding de la pregunta │
                    │  2. Búsqueda semántica        │→  Top-K chunks relevantes
                    │  3. Construir contexto        │
                    │  4. Enviar a Ollama/LLM       │→  Respuesta con fuentes
                    └─────────────────────────────┘
```

---

## STACK TÉCNICO

```
Embeddings:    nomic-embed-text (Ollama, local, gratuito)
               OR mxbai-embed-large (mejor calidad)
               OR text-embedding-3-small (OpenAI, fallback online)

Vector DB:     Supabase + pgvector (ya tienes Supabase, sin coste extra)

LLM:           qwen2.5:3b (local) — skill_11_ia_local.md
               Fallback: Claude Haiku

Parser PDF:    pdf-parse (Node.js)
Parser DOCX:   mammoth (Node.js)
Chunking:      LangChain.js TextSplitter OR implementación propia

Frontend:      React dropzone + lista de documentos
```

---

## CONFIGURACIÓN PGVECTOR EN SUPABASE

```sql
-- Habilitar extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla de documentos
CREATE TABLE documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT CHECK (tipo IN (
    'contrato', 'proceso', 'presupuesto_anterior', 'factura',
    'guia_interna', 'plantilla', 'legal', 'otro'
  )) DEFAULT 'otro',
  categoria TEXT,
  archivo_url TEXT NOT NULL,       -- URL en Supabase Storage
  archivo_tipo TEXT,               -- 'pdf', 'docx', 'txt', 'md'
  archivo_size INTEGER,
  estado TEXT CHECK (estado IN ('procesando', 'listo', 'error')) DEFAULT 'procesando',
  total_chunks INTEGER DEFAULT 0,
  etiquetas TEXT[] DEFAULT '{}',
  subido_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de chunks con embeddings
CREATE TABLE documento_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  embedding vector(768),           -- nomic-embed-text: 768 dims
  chunk_index INTEGER,             -- Posición en el documento
  metadata JSONB DEFAULT '{}',     -- página, sección, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para búsqueda semántica ultrarrápida
CREATE INDEX ON documento_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- RLS: solo admin gestiona documentos
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documento_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_docs"
  ON documentos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "all_read_docs"
  ON documentos FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "chunks_follow_doc"
  ON documento_chunks FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Función de Búsqueda Semántica
```sql
CREATE OR REPLACE FUNCTION buscar_documentos(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_tipo TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  documento_id UUID,
  documento_nombre TEXT,
  documento_tipo TEXT,
  contenido TEXT,
  similitud FLOAT
)
LANGUAGE SQL STABLE AS $$
  SELECT
    dc.id AS chunk_id,
    d.id AS documento_id,
    d.nombre AS documento_nombre,
    d.tipo AS documento_tipo,
    dc.contenido,
    1 - (dc.embedding <=> query_embedding) AS similitud
  FROM documento_chunks dc
  JOIN documentos d ON dc.documento_id = d.id
  WHERE
    d.estado = 'listo'
    AND (filter_tipo IS NULL OR d.tipo = filter_tipo)
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
$$;
```

---

## PIPELINE DE INGESTIÓN

### Instalar modelo de embeddings en Ollama
```bash
ollama pull nomic-embed-text      # 274MB, 768 dimensiones, rápido
# o mejor calidad:
ollama pull mxbai-embed-large     # 670MB, 1024 dimensiones
```

### Procesador de Documentos
```typescript
// lib/rag/ingest.ts
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

const CHUNK_SIZE = 500        // tokens por chunk
const CHUNK_OVERLAP = 50      // overlap entre chunks
const EMBED_MODEL = 'nomic-embed-text'

// 1. EXTRAER TEXTO según tipo de archivo
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  switch (mimeType) {
    case 'application/pdf':
      const pdf = await pdfParse(buffer)
      return pdf.text

    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      const docx = await mammoth.extractRawText({ buffer })
      return docx.value

    case 'text/plain':
    case 'text/markdown':
      return buffer.toString('utf-8')

    default:
      throw new Error(`Tipo de archivo no soportado: ${mimeType}`)
  }
}

// 2. DIVIDIR EN CHUNKS
export function splitIntoChunks(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/)
  const chunks: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_SIZE && current) {
      chunks.push(current.trim())
      // Overlap: mantener últimas palabras del chunk anterior
      const words = current.split(' ')
      current = words.slice(-CHUNK_OVERLAP).join(' ') + ' ' + sentence
    } else {
      current += (current ? ' ' : '') + sentence
    }
  }
  if (current.trim()) chunks.push(current.trim())

  return chunks.filter(c => c.length > 50) // Descartar chunks muy cortos
}

// 3. GENERAR EMBEDDINGS con Ollama
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.OLLAMA_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, prompt: text })
  })
  const { embedding } = await response.json()
  return embedding
}

// 4. PIPELINE COMPLETO: documento → chunks + embeddings → Supabase
export async function ingestDocument(
  documentoId: string,
  buffer: Buffer,
  mimeType: string
) {
  const supabase = createServiceClient()

  try {
    // Extraer texto
    const text = await extractText(buffer, mimeType)

    // Dividir en chunks
    const chunks = splitIntoChunks(text)

    // Generar embeddings en paralelo (lotes de 5 para no saturar Ollama)
    const BATCH_SIZE = 5
    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      const embeddings = await Promise.all(batch.map(generateEmbedding))

      const rows = batch.map((contenido, j) => ({
        documento_id: documentoId,
        contenido,
        embedding: JSON.stringify(embeddings[j]), // pgvector format
        chunk_index: i + j,
        metadata: { batch: Math.floor(i / BATCH_SIZE) }
      }))

      await supabase.from('documento_chunks').insert(rows)
    }

    // Marcar documento como listo
    await supabase
      .from('documentos')
      .update({ estado: 'listo', total_chunks: chunks.length })
      .eq('id', documentoId)

  } catch (error) {
    await supabase
      .from('documentos')
      .update({ estado: 'error' })
      .eq('id', documentoId)
    throw error
  }
}
```

---

## PIPELINE DE CONSULTA (RAG Query)

```typescript
// lib/rag/query.ts
export interface RAGResult {
  respuesta: string
  fuentes: {
    documento: string
    tipo: string
    fragmento: string
    similitud: number
  }[]
}

export async function queryRAG(
  pregunta: string,
  opciones?: {
    filtraTipo?: string
    maxFuentes?: number
    umbralSimilitud?: number
  }
): Promise<RAGResult> {
  const supabase = createServiceClient()
  const {
    filtraTipo,
    maxFuentes = 5,
    umbralSimilitud = 0.65
  } = opciones ?? {}

  // 1. Embedding de la pregunta
  const queryEmbedding = await generateEmbedding(pregunta)

  // 2. Búsqueda semántica en pgvector
  const { data: chunks } = await supabase.rpc('buscar_documentos', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: umbralSimilitud,
    match_count: maxFuentes,
    filter_tipo: filtraTipo ?? null
  })

  if (!chunks || chunks.length === 0) {
    return {
      respuesta: 'No encontré documentos relevantes para tu consulta. Prueba con otros términos o sube documentos relacionados.',
      fuentes: []
    }
  }

  // 3. Construir contexto para el LLM
  const contexto = chunks
    .map((c, i) => `[Fuente ${i + 1}: ${c.documento_nombre}]\n${c.contenido}`)
    .join('\n\n---\n\n')

  // 4. Prompt RAG
  const prompt = `Eres un asistente experto para una empresa de organización de eventos.
Responde la siguiente pregunta ÚNICAMENTE usando la información de los documentos proporcionados.
Si la respuesta no está en los documentos, dilo claramente.
Cita las fuentes específicas al responder.
Responde en español.

DOCUMENTOS DE REFERENCIA:
${contexto}

PREGUNTA: ${pregunta}

RESPUESTA:`

  // 5. Consultar LLM local
  const respuesta = await chatWithIA([
    { role: 'user', content: prompt }
  ])

  return {
    respuesta,
    fuentes: chunks.map(c => ({
      documento: c.documento_nombre,
      tipo: c.documento_tipo,
      fragmento: c.contenido.slice(0, 200) + '...',
      similitud: Math.round(c.similitud * 100)
    }))
  }
}
```

---

## API ROUTES

```typescript
// Subir nuevo documento
POST   /api/rag/documentos
Body:  FormData { archivo, nombre, tipo, descripcion, etiquetas }
→ Sube a Storage, crea registro, dispara ingestión en background

// Listar documentos
GET    /api/rag/documentos
Query: ?tipo=contrato&estado=listo&page=0

// Detalle de documento
GET    /api/rag/documentos/[id]

// Eliminar documento (elimina documento + todos sus chunks)
DELETE /api/rag/documentos/[id]

// Re-procesar documento (si falló la ingestión)
POST   /api/rag/documentos/[id]/reindexar

// Consultar la base de conocimiento
POST   /api/rag/consultar
Body:  { pregunta: string, filtro_tipo?: string }
Response: { respuesta: string, fuentes: [...] }

// Estado de ingestión en tiempo real
GET    /api/rag/documentos/[id]/estado
Response: { estado: 'procesando'|'listo'|'error', progreso: number }
```

---

## PÁGINAS Y COMPONENTES

### `/base-conocimiento` — Panel Principal (tipo NotebookLM)

#### Layout
```
┌──────────────────────────────────────────────────────┐
│  📚 Base de Conocimiento Empresarial                  │
│  [+ Subir documento]  [Buscar...]  [Filtrar por tipo] │
├──────────────────┬───────────────────────────────────┤
│  DOCUMENTOS      │   CHAT CON TUS DOCUMENTOS         │
│                  │                                    │
│ 📄 Contrato A    │  ┌─────────────────────────────┐  │
│    ✅ 45 chunks  │  │ ¿Cuál es el plazo de         │  │
│                  │  │ devolución en contratos?     │  │
│ 📄 Proceso B     │  └─────────────────────────────┘  │
│    ✅ 23 chunks  │                                    │
│                  │  Según el contrato tipo 2023,      │
│ 📄 Guía interna  │  el plazo es de 14 días...         │
│    🔄 procesando │                                    │
│                  │  📌 Fuentes:                       │
│ [+ Añadir]       │  • Contrato_Tipo_2023.pdf (94%)    │
│                  │  • Guia_Procesos_v2.docx (87%)     │
└──────────────────┴───────────────────────────────────┘
```

### Componentes Clave

```typescript
// Zona de subida con drag & drop
<DocumentUploader
  onUpload={handleUpload}
  accept=".pdf,.docx,.txt,.md"
  maxSize="50MB"
  multiple={true}
/>

// Tarjeta de documento con estado
<DocumentCard
  documento={doc}
  onDelete={handleDelete}
  onReindex={handleReindex}
  showProgress={doc.estado === 'procesando'}
/>

// Barra de progreso de ingestión (Supabase Realtime)
<IngestionProgress documentoId={id} />

// Chat RAG con fuentes citadas
<RAGChat
  placeholder="Pregunta sobre tus documentos..."
  showSources={true}
  filterByTipo={selectedTipo}
/>

// Chip de fuente con similitud
<FuenteChip
  nombre="Contrato_2023.pdf"
  similitud={94}
  fragmento="El plazo de devolución..."
  onClick={() => openDocument(doc.id)}
/>
```

---

## TIPOS DE DOCUMENTOS SOPORTADOS

| Tipo de archivo | Parser | Notas |
|---|---|---|
| PDF | pdf-parse | Texto digital y escaneado con OCR |
| DOCX / DOC | mammoth | Word con formato |
| TXT / MD | nativo | Texto plano y Markdown |
| CSV | papaparse | Datos tabulares |
| HTML | html-to-text | Páginas web guardadas |
| Imágenes (JPG/PNG) | Google Vision API (OCR) | Documentos escaneados |

---

## CATEGORÍAS DE DOCUMENTOS RECOMENDADAS

```typescript
const TIPOS_DOCUMENTO = [
  { value: 'contrato', label: '📋 Contratos', descripcion: 'Contratos con clientes y proveedores' },
  { value: 'proceso', label: '⚙️ Procesos', descripcion: 'Procedimientos y flujos de trabajo' },
  { value: 'presupuesto_anterior', label: '💰 Presupuestos', descripcion: 'Presupuestos anteriores de referencia' },
  { value: 'legal', label: '⚖️ Legal', descripcion: 'Documentación legal y normativa' },
  { value: 'guia_interna', label: '📖 Guías', descripcion: 'Manuales y guías internas del equipo' },
  { value: 'plantilla', label: '📝 Plantillas', descripcion: 'Plantillas reutilizables' },
  { value: 'proveedor', label: '🏭 Proveedores', descripcion: 'Documentación de proveedores' },
  { value: 'otro', label: '📂 Otros', descripcion: 'Otros documentos' }
]
```

---

## INTEGRACIÓN CON EL CHAT GLOBAL (skill_11)

El chat de IA del dashboard puede activar el RAG automáticamente cuando detecta que la pregunta es sobre documentos:

```typescript
// lib/ia/router.ts
export async function routeQuery(pregunta: string, userId: string) {
  // Palabras clave que indican consulta a documentos
  const docKeywords = ['contrato', 'proceso', 'cláusula', 'procedimiento',
    'acuerdo', 'condiciones', 'plazo', 'documentos', 'según', 'política']

  const isDocQuery = docKeywords.some(kw =>
    pregunta.toLowerCase().includes(kw)
  )

  if (isDocQuery) {
    // Usar RAG
    return queryRAG(pregunta)
  } else {
    // Usar contexto del dashboard (skill_11)
    return queryDashboard(pregunta, userId)
  }
}
```

---

## VARIABLES DE ENTORNO ADICIONALES

```env
OLLAMA_EMBED_MODEL=nomic-embed-text
RAG_CHUNK_SIZE=500
RAG_CHUNK_OVERLAP=50
RAG_MAX_SOURCES=5
RAG_SIMILARITY_THRESHOLD=0.65
```

---

## DEPENDENCIAS A INSTALAR

```bash
npm install pdf-parse              # Parsear PDFs
npm install mammoth                # Parsear DOCX
npm install papaparse              # Parsear CSV
npm install html-to-text           # Parsear HTML
npm install @types/pdf-parse -D

# Modelo de embeddings (Ollama)
ollama pull nomic-embed-text
```

---

## SETUP INICIAL

```bash
# 1. Habilitar pgvector en Supabase
# Dashboard Supabase → Database → Extensions → vector → Enable

# 2. Ejecutar migración SQL (schema arriba)

# 3. Descargar modelo de embeddings
ollama pull nomic-embed-text

# 4. Crear bucket en Supabase Storage
# Nombre: 'documentos-rag'  |  Acceso: privado
```

---

## OUTPUT ESPERADO
- Panel tipo NotebookLM para gestionar documentos de la empresa
- Ingestión automática: PDF/DOCX → chunks → embeddings → pgvector
- Chat semántico que responde con citas de tus propios documentos
- Progreso de ingestión en tiempo real con Supabase Realtime
- Integración transparente con el chat global del dashboard (skill_11)
- Búsqueda semántica: encuentra respuestas aunque no uses las palabras exactas

## CRITERIOS DE ACEPTACIÓN
- [ ] Subir PDF y que en < 2 min esté disponible para consultas
- [ ] Chat responde citando el documento fuente con % de similitud
- [ ] Progreso de ingestión visible en tiempo real
- [ ] Filtrar consultas por tipo de documento
- [ ] Eliminar documento elimina también todos sus chunks del vector DB
- [ ] Búsqueda semántica funciona (sinónimos, paráfrasis)
- [ ] Fallback claro cuando no hay documentos relevantes
- [ ] Re-indexar documento funciona si falló la primera vez
