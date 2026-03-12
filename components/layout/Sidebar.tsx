'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users,
  Receipt,
  Mail,
  Bot,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/home',      label: 'Inicio',      icon: LayoutDashboard },
  { href: '/asistente', label: 'Asistente AI', icon: Bot },
  { href: '/eventos',   label: 'Eventos',      icon: CalendarDays },
  { href: '/tareas',    label: 'Tareas',       icon: CheckSquare },
  { href: '/clientes',  label: 'Clientes',     icon: Users },
  { href: '/email',     label: 'Email',        icon: Mail },
  { href: '/finanzas',  label: 'Finanzas',     icon: Receipt },
  { href: '/ajustes',   label: 'Ajustes',      icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex h-screen w-56 flex-col shrink-0"
      style={{ background: 'hsl(var(--sidebar-bg))', borderRight: '1px solid hsl(var(--sidebar-border))' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shrink-0 glow-brand">
          <span className="text-white font-bold text-sm">SG</span>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold text-foreground">Somos</p>
          <p className="text-xs font-semibold" style={{ color: 'hsl(var(--primary))' }}>Gastronómico</p>
        </div>
      </div>

      {/* Separador */}
      <div className="mx-4 h-px" style={{ background: 'hsl(var(--sidebar-border))' }} />

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'gradient-brand text-white glow-brand shadow-sm'
                  : 'text-[hsl(var(--sidebar-muted))] hover:bg-white/5 hover:text-[hsl(var(--sidebar-fg))]'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer usuario (placeholder) */}
      <div className="px-3 py-3">
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">U</span>
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-xs font-medium text-foreground truncate">Usuario</p>
            <p className="text-[10px]" style={{ color: 'hsl(var(--sidebar-muted))' }}>Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
