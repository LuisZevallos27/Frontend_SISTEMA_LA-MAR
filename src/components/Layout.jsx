import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { MENU } from '../auth/roles'
import { useAuth } from '../auth/useAuth'
import Logo from './Logo'

function EnlaceEscritorio({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        'relative rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
        (isActive ? 'text-white' : 'text-slate-300 hover:text-white')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-activo"
              className="absolute inset-0 rounded-md bg-white/15"
              transition={{ type: 'spring', stiffness: 500, damping: 36 }}
            />
          )}
          <span className="relative">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function Drawer({ items, sesion, onCerrar, onSalir }) {
  // Cierra con Escape y bloquea el scroll de la pagina mientras esta abierto
  useEffect(() => {
    const alTeclear = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', alTeclear)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = previo
    }
  }, [onCerrar])

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCerrar}
      />
      <motion.aside
        className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85%] flex-col gap-4 bg-linear-to-b from-marino-900 to-marino-800 p-5 text-white shadow-elevada md:hidden"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
      >
        <div className="flex items-start justify-between">
          <Logo />
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="rounded-md p-2 text-lg leading-none hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl bg-white/10 p-3 text-sm leading-tight">
          <p className="font-semibold">
            {sesion?.nombres} {sesion?.apellidos}
          </p>
          <p className="mt-0.5 text-xs text-slate-300">{sesion?.cargo}</p>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <NavLink
                to={item.to}
                onClick={onCerrar}
                className={({ isActive }) =>
                  'block rounded-xl px-4 py-3 text-base font-medium transition-colors ' +
                  (isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white')
                }
              >
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <button
          type="button"
          onClick={onSalir}
          className="mt-auto rounded-full bg-lavanda px-4 py-3 text-sm font-semibold text-marino-900 hover:brightness-110"
        >
          Salir
        </button>
      </motion.aside>
    </>
  )
}

export default function Layout() {
  const { sesion, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const items = MENU[sesion?.cargo] ?? []
  const cerrarMenu = useCallback(() => setMenuAbierto(false), [])

  // Si la ventana pasa a ancho de escritorio con el menu abierto, se cierra
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const alCambiar = (e) => e.matches && setMenuAbierto(false)
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [])

  function salir() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-linear-to-r from-marino-900 to-marino-800 text-white shadow-elevada">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              className="rounded-md p-2 hover:bg-white/10 md:hidden"
              onClick={() => setMenuAbierto(true)}
              aria-label="Abrir menú"
              aria-expanded={menuAbierto}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
            <Logo />
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <EnlaceEscritorio key={item.to} to={item.to} label={item.label} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm leading-tight sm:block">
              <p className="font-medium">
                {sesion?.nombres} {sesion?.apellidos}
              </p>
              <p className="text-xs text-slate-300">{sesion?.cargo}</p>
            </div>
            <button
              type="button"
              onClick={salir}
              className="hidden rounded-full bg-lavanda px-4 py-1.5 text-sm font-semibold text-marino-900 shadow transition-all hover:brightness-110 md:block"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuAbierto && <Drawer key="drawer" items={items} sesion={sesion} onCerrar={cerrarMenu} onSalir={salir} />}
      </AnimatePresence>

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mx-auto max-w-7xl px-4 py-6"
      >
        <Outlet />
      </motion.main>
    </div>
  )
}