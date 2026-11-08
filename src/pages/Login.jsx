import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Navigate, useNavigate } from 'react-router'
import { mensajeError } from '../api/errores'
import { INICIO } from '../auth/roles'
import { useAuth } from '../auth/useAuth'
import Logo from '../components/Logo'

export default function Login() {
  const { sesion, login } = useAuth()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (sesion) return <Navigate to={INICIO[sesion.cargo] ?? '/mesas'} replace />

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const s = await login(usuario.trim(), password)
      navigate(INICIO[s.cargo] ?? '/mesas', { replace: true })
    } catch (err) {
      setError(
        err.response?.status === 401 ? 'Usuario o contraseña incorrectos' : mensajeError(err),
      )
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-marino-900 to-marino-800 text-white md:grid md:grid-cols-2">
      <motion.section
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center px-6 py-14 md:min-h-screen"
      >
        <Logo grande />
        <p className="mt-6 hidden max-w-xs text-center text-slate-300 md:block">
          Sistema de gestión para el personal de sala, recepción y administración.
        </p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease: 'easeOut' }}
        className="flex items-start justify-center px-6 pb-14 md:items-center md:bg-neutral-100 md:py-14 md:text-neutral-900"
      >
        <form onSubmit={enviar} className="w-full max-w-sm space-y-4">
          <h1 className="hidden text-2xl font-semibold md:block">Iniciar sesión</h1>

          <div>
            <label htmlFor="usuario" className="mb-1 block text-sm font-medium">
              ID de empleado (DNI)
            </label>
            <input
              id="usuario"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              required
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full rounded-full border border-transparent bg-white px-5 py-3 text-neutral-900 shadow-tarjeta outline-none focus:ring-2 focus:ring-lavanda md:border-neutral-300"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-full border border-transparent bg-white px-5 py-3 text-neutral-900 shadow-tarjeta outline-none focus:ring-2 focus:ring-lavanda md:border-neutral-300"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                key="error"
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-full bg-lavanda px-5 py-3 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110 disabled:opacity-60"
          >
            {cargando ? 'Ingresando…' : 'Iniciar sesión'}
          </button>
        </form>
      </motion.section>
    </div>
  )
}