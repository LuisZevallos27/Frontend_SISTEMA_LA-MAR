import { useId } from 'react'
import { motion } from 'motion/react'

// opciones: [{ valor, etiqueta, extra? }]
export default function Pestanas({ opciones, valor, onCambiar, etiqueta }) {
  const id = useId()

  return (
    <div
      role="tablist"
      aria-label={etiqueta}
      className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
    >
      {opciones.map((op) => {
        const activa = op.valor === valor
        return (
          <button
            key={op.valor}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(op.valor)}
            className={
              'relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ' +
              (activa ? 'text-white' : 'bg-white/70 text-marino-900 hover:bg-white')
            }
          >
            {activa && (
              <motion.span
                layoutId={`pestana-${id}`}
                className="absolute inset-0 rounded-full bg-marino-900 shadow-elevada"
                transition={{ type: 'spring', stiffness: 500, damping: 36 }}
              />
            )}
            <span className="relative">{op.etiqueta}</span>
            {op.extra && <span className="relative ml-2 text-xs opacity-70">{op.extra}</span>}
          </button>
        )
      })}
    </div>
  )
}