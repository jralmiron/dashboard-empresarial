# SKILL 07 — Bot de Telegram
## Fase 2 | Sub-agente: Telegram Agent

---

## OBJETIVO
Bot de Telegram para notificaciones automáticas y consultas rápidas desde el móvil.

## DEPENDENCIAS
- `skill_01_auth.md` — telegram_chat_id en perfil de usuario
- `skill_04_scrum.md` — Notificar tareas asignadas
- `skill_03_eventos.md` — Notificar eventos próximos

## CONFIGURACIÓN

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_URL=
```

### Setup del Bot
```typescript
// lib/telegram/bot.ts
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
  webHook: { port: 443 }
})
```

## COMANDOS DEL BOT

| Comando | Descripción | Rol |
|---|---|---|
| `/start` | Vincular cuenta con el dashboard | Todos |
| `/ayuda` | Lista de comandos disponibles | Todos |
| `/tareas` | Ver mis tareas pendientes | Todos |
| `/eventos` | Próximos eventos (7 días) | Todos |
| `/agenda` | Agenda del día | Todos |
| `/resumen` | Resumen diario completo | Admin |
| `/equipo` | Estado del equipo hoy | Admin |
| `/balance` | Balance del mes | Admin |

## NOTIFICACIONES AUTOMÁTICAS

### Para Empleados
```
🔔 Nueva tarea asignada
📌 Título: "Confirmar catering Boda García"
👤 Asignado por: Admin
📅 Fecha límite: 15 Mar 2026
🔴 Prioridad: Alta
Ver en dashboard: [enlace]
```

```
⚠️ Tarea vencida
📌 "Reservar fotógrafo" venció hace 2 días
Ver tarea: [enlace]
```

### Para Admin
```
✅ Tarea completada
👤 María López completó: "Diseño invitaciones"
📋 Evento: Boda García - 20 Mar 2026
```

```
📅 Recordatorio de evento
🎪 "Boda García" es mañana a las 18:00
📍 Salón El Pinar, Madrid
👥 Equipo: 4 personas asignadas
```

```
💰 Nueva factura registrada
📄 Proveedor: Catering Deluxe
💵 Importe: 1.250,00€
📋 Evento: Boda García
```

### Resumen Diario (9:00 AM automático)
```
📊 Buenos días! Resumen del día:

📅 EVENTOS HOY:
• 18:00 - Reunión cliente Boda Martínez

✅ TAREAS URGENTES:
• Confirmar catering (pendiente - María)
• Enviar presupuesto (pendiente - Admin)

📬 EMAILS: 3 sin leer

💰 BALANCE MES: +2.450€
```

## VINCULACIÓN DE CUENTA

### Proceso de Vinculación
1. Usuario abre el bot en Telegram
2. Envía `/start`
3. Bot genera un código de 6 dígitos
4. Usuario lo introduce en el dashboard (Configuración → Telegram)
5. El `telegram_chat_id` se guarda en su perfil
6. Confirmación en ambos lados

```typescript
// API route para vincular
POST /api/telegram/vincular
Body: { codigo: "123456", userId: "uuid" }
```

## WEBHOOK

```typescript
// app/api/telegram/webhook/route.ts
export async function POST(req: Request) {
  const update = await req.json()

  if (update.message?.text?.startsWith('/tareas')) {
    await handleTareasCommand(update.message.chat.id)
  }
  // ... otros comandos
}
```

## MENSAJES INTERACTIVOS (Inline Keyboard)

```typescript
// Al asignar una tarea, enviar botones inline
{
  text: "¿Aceptas esta tarea?",
  reply_markup: {
    inline_keyboard: [[
      { text: "✅ Acepto", callback_data: "tarea_acepta_uuid" },
      { text: "❌ Problema", callback_data: "tarea_problema_uuid" }
    ]]
  }
}
```

## OUTPUT ESPERADO
- Bot funcional con todos los comandos
- Notificaciones automáticas por eventos del sistema
- Vinculación de cuenta segura
- Resumen diario programado

## CRITERIOS DE ACEPTACIÓN
- [ ] /start vincula la cuenta correctamente
- [ ] /tareas muestra las tareas del usuario
- [ ] Notificación llega al asignar una tarea nueva
- [ ] Resumen diario se envía a las 9:00 AM
- [ ] Admin recibe alertas de eventos próximos
