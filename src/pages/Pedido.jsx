import { motion } from 'motion/react'
import { useNavigate, useParams } from 'react-router'
import Carta from '../components/Carta'
import PanelPedido from '../components/PanelPedido'
import usePedido from '../hooks/usePedido'
import { soles } from '../utils/formato'

export default function Pedido() {
  const { idMesa } = useParams()
  const navigate = useNavigate()
  const { mesa, platos, pedido, error, ocupado, abrir, agregar, cambiarCantidad, quitar, anular } =
    usePedido(idMesa)

  async function anularPedido() {
    if (!window.confirm('¿Anular el pedido de esta mesa? Se liberará la mesa.')) return
    if (await anular()) navigate('/mesas')
  }

  const cargando = mesa === undefined || pedido === undefined
  const numeroMesa = mesa ? String(mesa.numero).padStart(3, '0') : ''

  return (
    <div className="pb-20 lg:pb-0">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <button
            type="button"
            onClick={() => navigate('/mesas')}
            className="text-sm text-marino-800 hover:underline"
          >
            ← Volver a mesas
          </button>
          {mesa && (
            <h1 className="text-3xl font-bold text-marino-900">
              Mesa {numeroMesa} <span className="text-lg font-normal text-neutral-600">· {mesa.zona}</span>
            </h1>
          )}
        </div>
        {pedido && (
          <span className="rounded-full bg-white px-3 py-1 text-sm shadow-tarjeta">
            Pedido #{pedido.id} · {pedido.empleado}
          </span>
        )}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}

      {cargando && !error && <p className="text-neutral-600">Cargando…</p>}
      {!cargando && mesa === null && <p className="text-neutral-600">La mesa no existe.</p>}

      {mesa && pedido === null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white p-8 text-center shadow-tarjeta"
        >
          <p className="mb-1 text-neutral-700">Esta mesa no tiene un pedido abierto.</p>
          <p className="mb-5 text-sm text-neutral-500">Estado actual: {mesa.estado}</p>
          <button
            type="button"
            disabled={ocupado}
            onClick={abrir}
            className="rounded-full bg-lavanda px-6 py-3 font-semibold text-marino-900 shadow transition-all hover:brightness-110 disabled:opacity-60"
          >
            Abrir pedido
          </button>
        </motion.div>
      )}

      {mesa && pedido && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Carta platos={platos} onAgregar={agregar} deshabilitado={ocupado} />
          <PanelPedido
            pedido={pedido}
            ocupado={ocupado}
            onCambiar={cambiarCantidad}
            onQuitar={quitar}
            onAnular={anularPedido}
          />
        </div>
      )}

      {pedido && (
        <motion.a
          href="#resumen"
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between bg-marino-900 px-5 py-3 text-white shadow-elevada lg:hidden"
        >
          <span>{pedido.items.reduce((n, i) => n + i.cantidad, 0)} platos</span>
          <span className="font-semibold">Ver pedido · {soles(pedido.total)}</span>
        </motion.a>
      )}
    </div>
  )
}