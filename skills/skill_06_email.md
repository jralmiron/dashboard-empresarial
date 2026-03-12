# SKILL 06 — Gestión de Email (Gmail)
## Fase 2 | Sub-agente: Email Agent

---

## OBJETIVO
Integrar Gmail para gestionar correos directamente desde el dashboard sin salir de la aplicación.

## DEPENDENCIAS
- `skill_01_auth.md` — OAuth con Google configurado

## SCOPES GMAIL NECESARIOS
```typescript
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.modify'
]
```

## FUNCIONALIDADES

### Bandeja de Entrada
- Listar correos con paginación
- Marcar como leído/no leído
- Archivar y eliminar
- Indicador de adjuntos
- Búsqueda de correos
- Filtrar por: cliente, evento, etiqueta

### Lectura de Correos
- Vista completa del correo con HTML renderizado
- Mostrar adjuntos descargables
- Hilo de conversación completo
- Datos del remitente con avatar

### Redactar Correos
- Editor de texto enriquecido (TipTap o Quill)
- Adjuntar archivos (presupuestos, contratos)
- Plantillas predefinidas:
  - Confirmación de evento
  - Envío de presupuesto
  - Recordatorio de pago
  - Seguimiento post-evento
- Autocompletado de destinatario desde CRM de clientes
- Guardar borrador automático

### Vinculación con Clientes
- Detectar si el remitente es un cliente del CRM
- Mostrar ficha del cliente al abrir su correo
- Registrar el correo en el historial del cliente automáticamente

## API ROUTES

```typescript
GET  /api/email/messages            // Listar mensajes
GET  /api/email/messages/[id]       // Obtener mensaje completo
POST /api/email/send                // Enviar correo
POST /api/email/draft               // Guardar borrador
PUT  /api/email/messages/[id]/read  // Marcar como leído
GET  /api/email/threads/[id]        // Obtener hilo completo
GET  /api/email/labels              // Obtener etiquetas de Gmail
```

## LAYOUT DEL MÓDULO
```
┌─────────────┬──────────────────┬─────────────────────┐
│  CARPETAS   │   LISTA CORREOS  │  LECTURA / EDITOR   │
│             │                  │                     │
│ Bandeja (5) │ [De: Juan...]    │  De: Juan García    │
│ Enviados    │ [De: María...]   │  Asunto: Boda...    │
│ Borradores  │ [De: Pedro...]   │                     │
│ Spam        │                  │  Contenido...       │
│ ----------- │                  │                     │
│ ETIQUETAS   │                  │  [Responder]        │
│ Clientes    │                  │  [Reenviar]         │
│ Eventos     │                  │  [Archivar]         │
└─────────────┴──────────────────┴─────────────────────┘
```

## PLANTILLAS DE EMAIL

```typescript
const PLANTILLAS = {
  confirmacion_evento: {
    asunto: "Confirmación de su evento - {nombre_evento}",
    cuerpo: "Estimado/a {nombre_cliente}..."
  },
  envio_presupuesto: {
    asunto: "Presupuesto para {nombre_evento}",
    cuerpo: "Le adjuntamos el presupuesto solicitado..."
  },
  recordatorio_pago: {
    asunto: "Recordatorio de pago - Factura {numero}",
    cuerpo: "Le recordamos que tiene pendiente..."
  }
}
```

## COMPONENTES REQUERIDOS
- `<EmailSidebar />` — Carpetas y etiquetas
- `<EmailList />` — Lista de correos con preview
- `<EmailViewer />` — Visualizador de correo
- `<EmailComposer />` — Editor para redactar
- `<PlantillaSelector />` — Selector de plantillas
- `<ClienteChip />` — Chip con info del cliente remitente

## OUTPUT ESPERADO
- Bandeja de Gmail funcional dentro del dashboard
- Envío y respuesta de correos operativo
- Plantillas reutilizables implementadas
- Vinculación automática con clientes del CRM

## CRITERIOS DE ACEPTACIÓN
- [ ] Correos de Gmail se cargan en el dashboard
- [ ] Responder y reenviar correos funciona
- [ ] Plantillas se insertan correctamente
- [ ] Adjuntos se pueden descargar
- [ ] Correo vinculado a cliente del CRM muestra su ficha
