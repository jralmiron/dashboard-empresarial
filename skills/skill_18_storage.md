# SKILL 18 — Subida y Gestión de Archivos
## Supabase Storage + Uploadthing

---

## ROL DE ESTE SKILL

Gestionar subida, almacenamiento y acceso a archivos: contratos, imágenes de eventos, facturas, documentos de clientes y fotos de perfil. Supabase Storage es el backend; Uploadthing simplifica la integración en Next.js.

---

## STACK

```
Almacenamiento: Supabase Storage (buckets + RLS)
Upload helper:  Uploadthing (@uploadthing/react + uploadthing)
Alternativa:    Supabase Storage directo (sin Uploadthing para casos simples)
```

---

## ESTRUCTURA DE BUCKETS EN SUPABASE

| Bucket | Contenido | Acceso |
|---|---|---|
| `avatars` | Fotos de perfil | Público |
| `eventos` | Imágenes y contratos de eventos | Privado (RLS) |
| `facturas` | PDFs de facturas y presupuestos | Privado (RLS) |
| `documentos` | Documentos de clientes | Privado (RLS) |

---

## REGLAS

1. **Buckets privados por defecto** — Solo `avatars` puede ser público
2. **RLS en Storage** — Definir políticas desde el principio (misma organización/usuario)
3. **Validar en servidor** — Tipo MIME y tamaño máximo siempre en el server, no solo en cliente
4. **Nombres únicos** — Usar `crypto.randomUUID()` o `nanoid()` para nombres de archivo, nunca el nombre original
5. **URLs firmadas para privados** — Generar `createSignedUrl` para acceder a archivos privados

---

## OPCIÓN A — SUPABASE STORAGE DIRECTO

```typescript
// lib/storage/upload.ts
import { createClient } from '@/lib/supabase/client'

export async function uploadArchivo(
  bucket: string,
  archivo: File,
  carpeta: string
): Promise<string> {
  const supabase = createClient()
  const extension = archivo.name.split('.').pop()
  const nombre = `${carpeta}/${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(nombre, archivo, {
      contentType: archivo.type,
      upsert: false,
    })

  if (error) throw error
  return nombre
}

export async function getUrlFirmada(bucket: string, path: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1 hora

  if (error) throw error
  return data.signedUrl
}
```

---

## OPCIÓN B — UPLOADTHING (para UX avanzada con progreso)

```typescript
// app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { createClient } from '@/lib/supabase/server'

const f = createUploadthing()

export const uploadRouter = {
  imagenEvento: f({ image: { maxFileSize: '4MB' } })
    .middleware(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autorizado')
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // guardar URL en BD
      return { url: file.url }
    }),
} satisfies FileRouter
```

```typescript
// components/ui/FileUpload.tsx
'use client'
import { useUploadThing } from '@/lib/uploadthing'

export function FileUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const { startUpload, isUploading } = useUploadThing('imagenEvento')

  return (
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const res = await startUpload([file])
        if (res?.[0]) onUpload(res[0].url)
      }}
      disabled={isUploading}
    />
  )
}
```

---

## TIPOS PERMITIDOS POR CASO

| Módulo | Tipos | Tamaño máx |
|---|---|---|
| Foto de perfil | image/jpeg, image/png, image/webp | 2 MB |
| Imagen de evento | image/* | 4 MB |
| Contrato/documento | application/pdf | 10 MB |
| Factura generada | application/pdf | 5 MB |

---

## DEPENDENCIAS

```bash
# Supabase Storage viene incluido con @supabase/supabase-js
# Solo si se usa Uploadthing:
npm install uploadthing @uploadthing/react
```

---

## OUTPUT ESPERADO

`[SKILL_18_STORAGE] ✓ tarea completada`
