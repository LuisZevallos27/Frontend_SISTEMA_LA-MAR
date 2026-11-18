import { useId } from 'react'
import { motion } from 'motion/react'

// opciones: [{ valor, etiqueta, extra? }]
export default function Pestanas({ opciones, valor, onCambiar, etiqueta, oscuro = false }) {
  const id = useId()

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      {opciones.map((op) => {
        const activa = op.valor === valor
        const tieneExtra = op.extra !== undefined && op.extra !== null
        const color = activa
          ? oscuro
            ? 'text-marino-900'
            : 'text-white'
          : oscuro
            ? 'bg-white/10 text-white hover:bg-white/20'
            : 'bg-white/70 text-marino-900 hover:bg-white'
        return (
          <button
            key={op.valor}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(op.valor)}
            className={
              'relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ' +
              color
            }
          >
            {activa && (
              <motion.span
                layoutId={`pestana-${id}`}
                className={'absolute inset-0 rounded-full shadow-elevada ' + (oscuro ? 'bg-lavanda' : 'bg-marino-900')}
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{op.etiqueta}</span>
            {tieneExtra && <span className="relative ml-2 text-xs opacity-70">{op.extra}</span>}
          </button>
        )
      })}
    </div>
  )
}