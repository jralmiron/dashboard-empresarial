import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

/**
 * Cliente Supabase para uso en el SERVIDOR (Server Components, API Routes, Server Actions).
 * Lee las cookies de la request para mantener la sesión del usuario.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll es llamado desde Server Component — cookies de respuesta
            // no disponibles. Ignorar si el middleware refresca la sesión.
          }
        },
      },
    }
  )
}

/**
 * Cliente admin con SERVICE_ROLE para operaciones privilegiadas.
 * SOLO usar en server-side. NUNCA exponer al cliente.
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
