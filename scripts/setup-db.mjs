import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pdqmhqatjcaehtwgpzdx.supabase.co'
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkcW1ocWF0amNhZWh0d2dwemR4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzMxMjY5OCwiZXhwIjoyMDg4ODg4Njk4fQ.63pdwf7HBdqFbOQEXhVjwmJE5HtNSCJxfZm_cGmTguQ'

const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Ejecutar SQL directo via Management API
async function execSQL(sql, label) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE,
      'Authorization': `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  })
  console.log(`${label}: ${res.ok ? '✅' : '⚠️  ' + res.status}`)
}

// Verificar extensiones disponibles vía query directa
const steps = [
  ['profiles', 'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY'],
  ['events',   'ALTER TABLE events   ENABLE ROW LEVEL SECURITY'],
  ['tasks',    'ALTER TABLE tasks    ENABLE ROW LEVEL SECURITY'],
  ['clients',  'ALTER TABLE clients  ENABLE ROW LEVEL SECURITY'],
  ['budgets',  'ALTER TABLE budgets  ENABLE ROW LEVEL SECURITY'],
]

console.log('Verificando acceso a tablas con service role...')
for (const [table] of steps) {
  const { error } = await sb.from(table).select('id').limit(1)
  console.log(`  ${table}: ${error ? '❌ ' + error.message : '✅ accesible'}`)
}

console.log('\nNota: Para habilitar pgvector y configurar RLS policies,')
console.log('ve al SQL Editor de Supabase y ejecuta scripts/migrations/001_setup.sql')
