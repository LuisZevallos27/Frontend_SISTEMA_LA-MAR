import { AnimatePresence, motion } from 'motion/react'
import { soles } from '../utils/formato'
import MontoAnimado from './MontoAnimado'

export default function PanelPedido({ pedido, ocupado, onCambiar, onQuitar, onAnular }) {
  return (
    <motion.aside
      id="resumen"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="scroll-mt-20 rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5 lg:sticky lg:top-24 lg:self-start"
    >
      <h2 className="mb-3 text-lg font-bold text-marino-900">Pedido de la mesa</h2>

      {pedido.items.length === 0 && (
        <p className="py-6 text-center text-sm text-neutral-500">
          Aún no hay platos. Agrégalos desde la carta.
        </p>
      )}

      <ul className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          {pedido.items.map((it) => (
            <motion.li
              key={it.idPlato}
              layout
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="border-b border-neutral-200 bg-white py-3 last:border-b-0"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{it.nombre}</p>
                <button
                  type="button"
                  disabled={ocupado}
                  onClick={() => onQuitar(it)}
                  aria-label={`Quitar ${it.nombre}`}
                  className="text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={ocupado || it.cantidad <= 1}
                    onClick={() => onCambiar(it, it.cantidad - 1)}
                    aria-label={`Disminuir ${it.nombre}`}
                    className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition-colors hover:bg-neutral-100 disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{it.cantidad}</span>
                  <button
                    type="button"
                    disabled={ocupado}
                    onClick={() => onCambiar(it, it.cantidad + 1)}
                    aria-label={`Aumentar ${it.nombre}`}
                    className="h-8 w-8 rounded-full border border-neutral-300 font-bold transition-colors hover:bg-neutral-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <span className="font-semibold">{soles(it.subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-500">{soles(it.precioUnitario)} c/u</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <dl className="mt-4 space-y-1 border-t border-neutral-200 pt-3 text-sm">
        <div className="flex justify-between">
          <dt>Op. gravada</dt>
          <dd>
            <MontoAnimado valor={pedido.baseImponible} />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt>IGV (18%)</dt>
          <dd>
            <MontoAnimado valor={pedido.igv} />
          </dd>
        </div>
        <div className="flex justify-between text-base font-bold">
          <dt>Total</dt>
          <dd>
            <MontoAnimado valor={pedido.total} />
          </dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={ocupado}
        onClick={onAnular}
        className="mt-4 w-full rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        Anular pedido
      </button>
    </motion.aside>
  )
}