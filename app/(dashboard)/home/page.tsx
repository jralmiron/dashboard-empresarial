import { CalendarDays, CheckSquare, Users, TrendingUp, ArrowRight, Bot, Clock } from 'lucide-react'

// ── Datos placeholder (se reemplazarán con datos reales de Supabase) ──────────

const quickStats = [
  { label: 'Eventos activos',    value: '—', icon: CalendarDays },
  { label: 'Tareas pendientes',  value: '—', icon: CheckSquare },
  { label: 'Clientes',           value: '—', icon: Users },
  { label: 'Ingresos mes',       value: '—', icon: TrendingUp },
]

const recentActivity = [
  { text: 'Nuevo evento creado — Boda García', time: 'hace 2 h',   type: 'event' },
  { text: 'Tarea asignada — Decoración floral', time: 'hace 4 h',  type: 'task' },
  { text: 'Cliente añadido — Empresa XYZ',      time: 'hace 6 h',  type: 'client' },
  { text: 'Presupuesto enviado — Bodega Ruiz',  time: 'hace 1 día', type: 'budget' },
]

const upcomingEvents = [
  { name: 'Boda García',     date: '15 Mar', status: 'Confirmado',  guests: 120 },
  { name: 'Cena Corporativa', date: '18 Mar', status: 'En progreso', guests: 45  },
  { name: 'Cumpleaños VIP',  date: '22 Mar', status: 'Pendiente',   guests: 30  },
]

const statusColor: Record<string, string> = {
  'Confirmado':   'badge-active',
  'En progreso':  'badge-progress',
  'Pendiente':    'badge-pending',
}

// ──────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-5 animate-fade-in">

      {/* ── Fila superior: Asistente + Quick stats ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Botón asistente IA */}
        <div className="lg:col-span-1 card-dark card-accent p-5 flex flex-col justify-between gap-4 min-h-[130px]">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Asistente IA</p>
            <p className="text-foreground font-semibold">{saludo} 👋</p>
          </div>
          <a
            href="/asistente"
            className="inline-flex items-center justify-center gap-2 rounded-xl gradient-brand glow-brand text-white text-sm font-semibold px-4 py-2.5 transition-opacity hover:opacity-90"
          >
            <Bot className="h-4 w-4" />
            Hablar con el asistente
          </a>
        </div>

        {/* Quick stats — 2×2 grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {quickStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card-dark p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Fila central: Actividad + Eventos próximos ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Actividad reciente */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Actividad reciente</h2>
            <a href="#" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <ul className="space-y-3">
            {recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="dot-brand mt-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">{item.text}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />{item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Próximos eventos */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Próximos eventos</h2>
            <a href="/eventos" className="text-xs text-primary hover:underline flex items-center gap-1">
              Ver todo <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          <ul className="space-y-3">
            {upcomingEvents.map((event, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-1">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                  <p className="text-xs text-muted-foreground">{event.guests} personas · {event.date}</p>
                </div>
                <span className={statusColor[event.status] ?? 'badge-pending'}>
                  {event.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Fila inferior: Gráfico placeholder + Tareas rápidas ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Gráfico de ingresos (placeholder — Recharts vendrá en skill_17) */}
        <div className="lg:col-span-2 card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Control de ingresos</h2>
            <span className="text-xs text-muted-foreground">Últimos 30 días</span>
          </div>
          <div className="h-36 flex items-center justify-center rounded-xl bg-background-subtle border border-border">
            <p className="text-xs text-muted-foreground">Gráfico disponible tras conectar Supabase</p>
          </div>
        </div>

        {/* Resumen de tareas */}
        <div className="card-dark p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Tareas del equipo</h2>
            <a href="/tareas" className="text-xs text-primary hover:underline">Ver</a>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Completadas', value: '—', color: 'text-green-400' },
              { label: 'En progreso', value: '—', color: 'text-blue-400' },
              { label: 'Pendientes',  value: '—', color: 'text-orange-400' },
              { label: 'Urgentes',    value: '—', color: 'text-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
