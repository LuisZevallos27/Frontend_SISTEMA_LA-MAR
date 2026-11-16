import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fechaHoraCorta } from '../utils/fechas'
import { cantidad, soles } from '../utils/formato'

const BADGES = {
    Pendiente: 'bg-amber-100 text-amber-800',
    Recibido: 'bg-green-100 text-green-800',
    Anulado: 'bg-neutral-200 text-neutral-600',
}

const boton = 'rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50'

export default function TarjetaOrden({ orden, ocupada, onAccion }) {
    const [abierta, setAbierta] = useState(false)
    const pendiente = orden.estado === 'Pendiente'

    return (
        <motion.article
            layout="position"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5"
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                        Orden #{orden.id} · {orden.proveedor}
                    </p>
                    <p className="text-sm text-neutral-600">
                        RUC {orden.ruc} · {fechaHoraCorta(orden.fecha)} · {orden.items.length}{' '}
                        {orden.items.length === 1 ? 'insumo' : 'insumos'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <p className="text-lg font-bold">{soles(orden.costoTotal)}</p>
                    <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + (BADGES[orden.estado] ?? '')}>
                        {orden.estado}
                    </span>
                    <button
                        type="button"
                        onClick={() => setAbierta((v) => !v)}
                        aria-expanded={abierta}
                        className={boton + ' border border-neutral-300 hover:bg-neutral-100'}
                    >
                        {abierta ? 'Ocultar detalle' : 'Ver detalle'}
                    </button>
                    {pendiente && (
                        <button
                            type="button"
                            disabled={ocupada}
                            onClick={() => onAccion(orden, 'recibir')}
                            className={boton + ' bg-lavanda text-marino-900 hover:brightness-110'}
                        >
                            Recibir
                        </button>
                    )}
                    {pendiente && (
                        <button
                            type="button"
                            disabled={ocupada}
                            onClick={() => onAccion(orden, 'anular')}
                            className={boton + ' border border-red-300 text-red-700 hover:bg-red-50'}
                        >
                            Anular
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence initial={false}>
                {abierta && (
                    <motion.div
                        key="detalle"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 overflow-x-auto border-t border-neutral-200 pt-3">
                            <table className="w-full min-w-[420px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-neutral-500">
                                        <th className="pb-1 font-semibold">Insumo</th>
                                        <th className="pb-1 text-right font-semibold">Cantidad</th>
                                        <th className="pb-1 text-right font-semibold">Costo unit.</th>
                                        <th className="pb-1 text-right font-semibold">Costo total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orden.items.map((it) => (
                                        <tr key={it.idInsumo} className="border-t border-neutral-100">
                                            <td className="py-1.5">{it.insumo}</td>
                                            <td className="py-1.5 text-right">
                                                {cantidad(it.cantidad)} {it.unidadMedida}
                                            </td>
                                            <td className="py-1.5 text-right">{soles(it.costoUnitario)}</td>
                                            <td className="py-1.5 text-right font-medium">{soles(it.costoTotal)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.article>
    )
}