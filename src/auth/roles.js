export const ROLES = { MOZO: 'Mozo', RECEPCIONISTA: 'Recepcionista', ADMIN: 'Administrador' }

// Pantalla a la que llega cada rol despues del login
export const INICIO = {
  [ROLES.MOZO]: '/mesas',
  [ROLES.RECEPCIONISTA]: '/reservas',
  [ROLES.ADMIN]: '/abastecimiento',
}

// Opciones del menu segun el rol
export const MENU = {
  [ROLES.MOZO]: [{ to: '/mesas', label: 'Mesas' }],
  [ROLES.RECEPCIONISTA]: [
    { to: '/reservas', label: 'Reservas' },
    { to: '/mesas', label: 'Mesas' },
  ],
  [ROLES.ADMIN]: [
    { to: '/abastecimiento', label: 'Abastecimiento' },
    { to: '/mesas', label: 'Mesas' },
    { to: '/reservas', label: 'Reservas' },
  ],
}