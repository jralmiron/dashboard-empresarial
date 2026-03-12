#!/usr/bin/env tsx
/**
 * Auditoría de seguridad automatizada
 * Ejecutar: npx tsx scripts/security-audit.ts
 */

import { execSync } from 'child_process'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'

interface Finding {
  severity: Severity
  check: string
  detail: string
}

const findings: Finding[] = []
const ROOT = process.cwd()

function fail(severity: Severity, check: string, detail: string) {
  findings.push({ severity, check, detail })
}

function pass(check: string) {
  console.log(`  ✅ ${check}`)
}

// ─── 1. SECRETOS EN CÓDIGO ──────────────────────────────────────────────────

console.log('\n🔍 [1/5] Buscando secretos hardcodeados en el código...')

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{32,}/g,           // API keys genéricas (OpenAI, DeepSeek)
  /eyJhbGciOiJ[a-zA-Z0-9._-]{20,}/g, // JWT tokens
  /ghp_[a-zA-Z0-9]{36}/g,            // GitHub tokens
  /AKIA[0-9A-Z]{16}/g,               // AWS access keys
  /password\s*=\s*['"][^'"]{4,}['"]/gi, // contraseñas hardcodeadas
]

function scanDir(dir: string, exts = ['.ts', '.tsx', '.js', '.mjs', '.env']): string[] {
  const files: string[] = []
  const skip = ['node_modules', '.next', 'coverage', '.git', 'playwright-report']
  for (const entry of readdirSync(dir)) {
    if (skip.includes(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      files.push(...scanDir(full, exts))
    } else if (exts.some(e => full.endsWith(e))) {
      files.push(full)
    }
  }
  return files
}

let secretsFound = false
const SKIP_SECRETS = ['.env.example', '__tests__', 'e2e', 'scripts/security-audit']
for (const file of scanDir(ROOT)) {
  if (SKIP_SECRETS.some(s => file.replace(/\\/g, '/').includes(s))) continue
  const content = readFileSync(file, 'utf-8')
  for (const pattern of SECRET_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      fail('CRITICAL', 'Secreto hardcodeado', `${file.replace(ROOT, '.')}: ${matches[0].slice(0, 20)}...`)
      secretsFound = true
    }
  }
}
if (!secretsFound) pass('Sin secretos hardcodeados detectados')

// ─── 2. VARIABLES DE ENTORNO PÚBLICAS PELIGROSAS ───────────────────────────

console.log('\n🔍 [2/5] Verificando variables de entorno...')

const DANGEROUS_PUBLIC = [
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_DEEPSEEK_API_KEY',
  'NEXT_PUBLIC_ENCRYPTION_KEY',
  'NEXT_PUBLIC_JWT_SECRET',
]

for (const file of scanDir(ROOT, ['.env', '.env.local', '.env.production', '.env.example'])) {
  const content = readFileSync(file, 'utf-8')
  for (const varName of DANGEROUS_PUBLIC) {
    if (content.includes(varName)) {
      fail('CRITICAL', 'Variable pública peligrosa', `${varName} en ${file.replace(ROOT, '.')}`)
    }
  }
}
pass('Sin variables SERVICE_ROLE ni secrets expuestos como NEXT_PUBLIC_')

// ─── 3. CABECERAS DE SEGURIDAD ──────────────────────────────────────────────

console.log('\n🔍 [3/5] Verificando cabeceras de seguridad en next.config.mjs...')

try {
  const config = readFileSync(join(ROOT, 'next.config.mjs'), 'utf-8')
  const requiredHeaders = [
    ['X-Frame-Options',        'Protección clickjacking'],
    ['X-Content-Type-Options', 'Protección MIME sniffing'],
    ['Referrer-Policy',        'Control de referrer'],
  ]
  for (const [header, desc] of requiredHeaders) {
    if (config.includes(header)) {
      pass(`${header} (${desc})`)
    } else {
      fail('HIGH', 'Cabecera de seguridad ausente', `${header}: ${desc}`)
    }
  }
} catch {
  fail('HIGH', 'next.config.mjs', 'No se pudo leer el archivo de configuración')
}

// ─── 4. AUDITORÍA DE DEPENDENCIAS (npm audit) ───────────────────────────────

console.log('\n🔍 [4/5] Ejecutando npm audit...')

try {
  execSync('npm audit --audit-level=high --json', { stdio: 'pipe' })
  pass('Sin vulnerabilidades HIGH o CRITICAL en dependencias')
} catch (err: unknown) {
  const output = (err as { stdout?: Buffer }).stdout?.toString() ?? ''
  try {
    const report = JSON.parse(output) as { metadata?: { vulnerabilities?: { high?: number; critical?: number } } }
    const vulns = report?.metadata?.vulnerabilities ?? {}
    const critical = vulns.critical ?? 0
    const high = vulns.high ?? 0
    if (critical > 0) fail('CRITICAL', 'npm audit', `${critical} vulnerabilidades CRITICAL en dependencias`)
    if (high > 0)     fail('HIGH',     'npm audit', `${high} vulnerabilidades HIGH en dependencias`)
  } catch {
    fail('MEDIUM', 'npm audit', 'No se pudo parsear el resultado de npm audit')
  }
}

// ─── 5. MIDDLEWARE PROTEGE RUTAS ────────────────────────────────────────────

console.log('\n🔍 [5/5] Verificando middleware de protección de rutas...')

try {
  const middleware    = readFileSync(join(ROOT, 'middleware.ts'), 'utf-8')
  const middlewareLib = readFileSync(join(ROOT, 'lib/supabase/middleware.ts'), 'utf-8')
  if (middleware.includes('updateSession')) {
    pass('middleware.ts llama a updateSession')
  } else {
    fail('HIGH', 'Middleware', 'middleware.ts no llama a updateSession de Supabase')
  }
  if (middlewareLib.includes('/login')) {
    pass('Redirección a /login configurada en lib/supabase/middleware.ts')
  } else {
    fail('HIGH', 'Middleware', 'No se detecta redirección a /login para rutas protegidas')
  }
} catch {
  fail('CRITICAL', 'Middleware', 'middleware.ts no existe — rutas desprotegidas')
}

// ─── RESUMEN ─────────────────────────────────────────────────────────────────

const critical = findings.filter(f => f.severity === 'CRITICAL')
const high     = findings.filter(f => f.severity === 'HIGH')
const medium   = findings.filter(f => f.severity === 'MEDIUM')

console.log('\n' + '═'.repeat(60))
console.log('📊  RESUMEN AUDITORÍA DE SEGURIDAD')
console.log('═'.repeat(60))

if (findings.length === 0) {
  console.log('\n🎉  Sin hallazgos de seguridad. Todo en orden.\n')
} else {
  for (const f of findings) {
    const icon = f.severity === 'CRITICAL' ? '🔴' : f.severity === 'HIGH' ? '🟠' : '🟡'
    console.log(`\n${icon} [${f.severity}] ${f.check}`)
    console.log(`   ${f.detail}`)
  }
  console.log(`\n─────────────────────────────────────────────`)
  console.log(`  🔴 CRITICAL : ${critical.length}`)
  console.log(`  🟠 HIGH     : ${high.length}`)
  console.log(`  🟡 MEDIUM   : ${medium.length}`)
  console.log(`─────────────────────────────────────────────\n`)
}

process.exit(critical.length > 0 || high.length > 0 ? 1 : 0)
