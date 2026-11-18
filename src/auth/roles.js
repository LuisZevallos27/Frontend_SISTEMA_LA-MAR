import { CalendarDays, LayoutDashboard, LayoutGrid, Truck } from 'lucide-react'

export const ROLES = { MOZO: 'Mozo', RECEPCIONISTA: 'Recepcionista', ADMIN: 'Administrador' }

// Pantalla a la que llega cada rol despues del login
export const INICIO = {
  [ROLES.MOZO]: '/mesas',
  [ROLES.RECEPCIONISTA]: '/reservas',
  [ROLES.ADMIN]: '/dashboard',
}

const DASHBOARD = { to: '/dashboard', label: 'Dashboard', icono: LayoutDashboard }
const MESAS = { to: '/mesas', label: 'Mesas', icono: LayoutGrid }
const RESERVAS = { to: '/reservas', label: 'Reservas', icono: CalendarDays }
const ABASTECIMIENTO = { to: '/abastecimiento', label: 'Abastecimiento', icono: Truck }

// Opciones del menu segun el rol
export const MENU = {
  [ROLES.MOZO]: [MESAS],
  [ROLES.RECEPCIONISTA]: [RESERVAS, MESAS],
  [ROLES.ADMIN]: [DASHBOARD, ABASTECIMIENTO, MESAS, RESERVAS],
}