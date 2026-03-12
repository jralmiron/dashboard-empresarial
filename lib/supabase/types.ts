/**
 * Tipos de la base de datos — generados por Supabase CLI.
 * Para regenerar: npx supabase gen types typescript --project-id [ID] > lib/supabase/types.ts
 *
 * Este archivo se actualiza automáticamente. No editar manualmente.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Los tipos se generan automáticamente con: npx supabase gen types
      // Por ahora se define como placeholder — se actualizará tras crear el schema
      [tableName: string]: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'admin' | 'manager' | 'staff' | 'viewer'
      event_status: 'borrador' | 'confirmado' | 'en_curso' | 'completado' | 'cancelado'
      task_status: 'pendiente' | 'en_progreso' | 'revision' | 'completada'
      task_priority: 'baja' | 'media' | 'alta' | 'urgente'
      budget_status: 'borrador' | 'enviado' | 'aprobado' | 'rechazado' | 'facturado'
    }
  }
}
