import { motion } from 'motion/react'

const TONOS = {
    marino: 'from-marino-800 to-marino-700',
    lavanda: 'from-lavanda to-indigo-400',
    verde: 'from-emerald-500 to-green-400',
    ambar: 'from-amber-500 to-yellow-400',
}

export function Panel({ titulo, subtitulo, Icono, derecha, className = '', children }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={
                'min-w-0 rounded-2xl bg-white p-5 shadow-tarjeta ring-1 ring-black/5 transition-shadow hover:shadow-elevada ' +
                className
            }
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    {Icono && (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-marino-900/5 text-marino-800">
                            <Icono className="h-5 w-5" aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-bold text-marino-900">{titulo}</h2>
                        {subtitulo && <p className="text-xs text-neutral-500">{subtitulo}</p>}
                    </div>
                </div>
                {derecha}
            </div>
            {children}
        </motion.section>
    )
}

// visual: reemplaza el ícono (por ejemplo, un anillo). grafico: mini gráfica debajo del valor.
export function TarjetaKpi({ titulo, Icono, tono = 'marino', pie, visual, grafico, children }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative min-w-0 overflow-hidden rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5"
        >
            <span className={'absolute inset-x-0 top-0 h-1 bg-linear-to-r ' + TONOS[tono]} />
            <div className="flex items-start justify-between gap-2 pt-1">
                <p className="text-sm font-medium text-neutral-500">{titulo}</p>
                {visual ?? (
                    <span
                        className={
                            'grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow ' + TONOS[tono]
                        }
                    >
                        <Icono className="h-5 w-5" aria-hidden="true" />
                    </span>
                )}
            </div>
            <p className="mt-2 text-3xl font-bold text-marino-900">{children}</p>
            <div className="mt-1 text-sm text-neutral-500">{pie}</div>
            {grafico && <div className="-mx-1 mt-2">{grafico}</div>}
        </motion.article>
    )
}