# SKILL 19 — Procesos Asíncronos
## Redis + BullMQ

---

## ROL DE ESTE SKILL

Gestionar tareas que no deben bloquear las peticiones del usuario: envío de emails, generación de PDFs, notificaciones por Telegram, sincronizaciones con APIs externas y recordatorios programados.

---

## STACK

```
Cola:      BullMQ (bullmq)
Broker:    Redis (ioredis)
Worker:    Proceso separado o API route dedicada
Dashboard: Bull Board (@bull-board/api + @bull-board/nextjs)
```

---

## CUÁNDO USAR ESTE SKILL

| Tarea | Sin BullMQ | Con BullMQ |
|---|---|---|
| Enviar email de confirmación | Bloquea respuesta HTTP | Job en background |
| Generar PDF de factura | Timeout en producción | Job asíncrono |
| Sync Google Calendar | Ralentiza la petición | Job programado |
| Recordatorio de evento (24h antes) | Imposible sin colas | Delayed job |
| Importar CSV de clientes | Bloquea server | Job procesado en chunks |

---

## REGLAS

1. **No usar este skill en Fase 1-2** — Solo cuando el dashboard básico esté estable
2. **Redis en Upstash** — Para Vercel/serverless usar Upstash Redis (compatible BullMQ)
3. **Workers separados** — Los workers no corren en el mismo proceso que Next.js
4. **Idempotencia** — Diseñar jobs para que si se ejecutan dos veces no causen problemas
5. **Dead letter queue** — Configurar `attempts` y `backoff` para reintentos automáticos

---

## ESTRUCTURA

```
src/
├── jobs/
│   ├── queues.ts           (definición de colas)
│   ├── workers/
│   │   ├── email.worker.ts
│   │   ├── pdf.worker.ts
│   │   └── telegram.worker.ts
│   └── processors/
│       ├── email.processor.ts
│       └── pdf.processor.ts
└── app/api/
    └── jobs/
        └── route.ts        (endpoint para encolar desde server actions)
```

---

## DEFINICIÓN DE COLAS

```typescript
// jobs/queues.ts
import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

export const emailQueue = new Queue('email', { connection: redis })
export const pdfQueue = new Queue('pdf', { connection: redis })
export const telegramQueue = new Queue('telegram', { connection: redis })
```

---

## CONEXIÓN REDIS

```typescript
// lib/redis.ts
import { Redis } from 'ioredis'

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // requerido por BullMQ
})
```

---

## EJEMPLO: JOB DE EMAIL

```typescript
// jobs/processors/email.processor.ts
import { Worker } from 'bullmq'
import { redis } from '@/lib/redis'

export const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, html } = job.data
    // enviar con Resend, SendGrid o Gmail API
    await sendEmail({ to, subject, html })
  },
  {
    connection: redis,
    concurrency: 5,
  }
)

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} falló:`, err)
})
```

---

## ENQUEUE DESDE SERVER ACTION

```typescript
// app/actions/evento.actions.ts
import { emailQueue } from '@/jobs/queues'

export async function confirmarEvento(eventoId: string) {
  // ... lógica de confirmación en BD

  // Encolar email en background
  await emailQueue.add('confirmacion', {
    to: cliente.email,
    subject: `Evento confirmado: ${evento.nombre}`,
    html: renderEmailTemplate('confirmacion', { evento }),
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  })
}
```

---

## JOBS PROGRAMADOS (RECORDATORIOS)

```typescript
// Recordatorio 24h antes del evento
await emailQueue.add('recordatorio', payload, {
  delay: differenceInMilliseconds(subHours(evento.fecha, 24), new Date()),
})
```

---

## VARIABLES DE ENTORNO

```env
REDIS_URL=redis://localhost:6379
# En producción con Upstash:
REDIS_URL=rediss://default:TOKEN@ENDPOINT.upstash.io:6380
```

---

## DEPENDENCIAS

```bash
npm install bullmq ioredis
npm install @bull-board/api @bull-board/nextjs  # dashboard (opcional)
```

---

## OUTPUT ESPERADO

`[SKILL_19_ASYNC] ✓ tarea completada`
