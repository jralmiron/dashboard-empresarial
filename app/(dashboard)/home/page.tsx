import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, CheckSquare, Users, TrendingUp } from 'lucide-react'

const stats = [
  {
    title: 'Eventos activos',
    value: '—',
    icon: CalendarDays,
    description: 'Próximos 30 días',
  },
  {
    title: 'Tareas pendientes',
    value: '—',
    icon: CheckSquare,
    description: 'Sin completar',
  },
  {
    title: 'Clientes',
    value: '—',
    icon: Users,
    description: 'Total activos',
  },
  {
    title: 'Ingresos mes',
    value: '—',
    icon: TrendingUp,
    description: 'Presupuestos aprobados',
  },
]

export default async function HomePage() {
  const hora = new Date().getHours()
  const saludo =
    hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {saludo} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bienvenido al panel de gestión de Somos Gastronómico
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ title, value, icon: Icon, description }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Área principal — próximamente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Los eventos aparecerán aquí una vez configurada la base de datos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Las tareas del equipo aparecerán aquí.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
