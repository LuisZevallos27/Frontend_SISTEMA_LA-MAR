import { useCallback, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import { ROLES } from '../auth/roles'
import { useAuth } from '../auth/useAuth'
import IconoMesa from '../components/IconoMesa'
import Pestanas from '../components/Pestanas'

const ZONAS = ['Piso 1', 'Piso 2', 'VIP']

const ESTILOS = {
  Disponible: { borde: 'border-mesa-libre', texto: 'text-mesa-libre', fondo: 'bg-green-50' },
  Reservado: { borde: 'border-mesa-reservada', texto: 'text-mesa-reservada', fondo: 'bg-amber-50' },
  Ocupado: { borde: 'border-mesa-ocupada', texto: 'text-mesa-ocupada', fondo: 'bg-red-50' },
}

const contenedor = { oculto: {}, visible: { transition: { staggerChildren: 0.04 } } }
const tarjeta = {
  oculto: { opacity: 0, y: 14, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
}

export default function Mesas() {
  const { sesion } = useAuth()
  const navigate = useNavigate()
  const [mesas, setMesas] = useState(null)
  const [error, setError] = useState('')
  const [zona, setZona] = useState(ZONAS[0])

  const puedeAtender = sesion.cargo === ROLES.MOZO || sesion.cargo === ROLES.ADMIN

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/mesas')
      setMesas(data)
      setError('')
    } catch (e) {
      setError(mensajeError(e, 'No se pudieron cargar las mesas'))
    }
  }, [])

  // Carga inicial y actualizacion automatica cada 15 segundos
  useEffect(() => {
    cargar()
    const temporizador = setInterval(cargar, 15000)
    return () => clearInterval(temporizador)
  }, [cargar])

  const visibles = (mesas ?? []).filter((m) => m.zona === zona)
  const libres = (z) => (mesas ?? []).filter((m) => m.zona === z && m.estado === 'Disponible').length

  return (
    <div>
      <h1 className="mb-4 text-center text-3xl font-bold text-marino-900 md:text-left">Escoger mesa</h1>

      <div className="mb-4">
        <Pestanas
          etiqueta="Zonas del local"
          opciones={ZONAS.map((z) => ({
            valor: z,
            etiqueta: z,
            extra: mesas ? `${libres(z)} libres` : undefined,
          }))}
          valor={zona}
          onCambiar={setZona}
        />
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm md:justify-start">
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-mesa-libre" /> Disponible
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-mesa-reservada" /> Reservado
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-mesa-ocupada" /> Ocupado
        </span>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      {mesas === null && !error && <p className="text-neutral-600">Cargando mesas…</p>}
      {mesas && visibles.length === 0 && <p className="text-neutral-600">No hay mesas en esta zona.</p>}

      <motion.div
        key={zona}
        variants={contenedor}
        initial="oculto"
        animate="visible"
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        {visibles.map((m) => {
          const estilo = ESTILOS[m.estado] ?? ESTILOS.Disponible
          return (
            <motion.button
              key={m.id}
              type="button"
              variants={tarjeta}
              whileHover={puedeAtender ? { y: -4 } : undefined}
              whileTap={puedeAtender ? { scale: 0.97 } : undefined}
              disabled={!puedeAtender}
              onClick={() => navigate(`/pedido/${m.id}`)}
              className={
                `flex flex-col items-center rounded-2xl border-2 p-4 shadow-tarjeta transition-shadow ` +
                `${estilo.borde} ${estilo.texto} ${estilo.fondo} ` +
                (puedeAtender ? 'hover:shadow-elevada' : 'cursor-default')
              }
            >
              <IconoMesa className="h-16 w-16" />
              <span className="mt-2 text-xl font-bold text-neutral-900">
                {String(m.numero).padStart(3, '0')}
              </span>
              <span className="text-sm text-neutral-600">{m.capacidad} personas</span>
              <span className="mt-1 text-xs font-semibold uppercase">{m.estado}</span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}