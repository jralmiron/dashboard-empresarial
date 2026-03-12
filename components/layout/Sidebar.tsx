'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Users,
  Receipt,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/home',      label: 'Inicio',     icon: LayoutDashboard },
  { href: '/eventos',   label: 'Eventos',    icon: CalendarDays },
  { href: '/tareas',    label: 'Tareas',     icon: CheckSquare },
  { href: '/clientes',  label: 'Clientes',   icon: Users },
  { href: '/finanzas',  label: 'Finanzas',   icon: Receipt },
  { href: '/ajustes',   label: 'Ajustes',    icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col bg-secondary text-secondary-foreground">
      {/* Marca */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">SG</span>
        </div>
        <span className="font-semibold text-sm leading-tight">
          Somos<br />Gastronómico
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
