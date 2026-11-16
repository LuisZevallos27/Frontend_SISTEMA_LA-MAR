import { motion } from 'motion/react'

const BADGES = {
    Pendiente: 'bg-amber-100 text-amber-800',
    Confirmada: 'bg-blue-100 text-blue-800',
    Atendida: 'bg-green-100 text-green-800',
    Cancelada: 'bg-neutral-200 text-neutral-600',
}

const boton = 'rounded-full px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50'

export default function TarjetaReserva({ reserva, ocupada, onAccion }) {
    const activa = reserva.estado === 'Pendiente' || reserva.estado === 'Confirmada'
    const documento = reserva.clienteDni?.length === 11 ? 'RUC' : 'DNI'

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5 sm:flex-row sm:items-center"
        >
            <div className="flex items-center gap-4 sm:w-56">
                <p className="text-3xl font-bold text-marino-900">{reserva.hora?.slice(0, 5) ?? '--:--'}</p>
                <div className="text-sm leading-tight">
                    <p className="font-semibold">Mesa {String(reserva.numeroMesa).padStart(3, '0')}</p>
                    <p className="text-neutral-600">{reserva.zona}</p>
                </div>
            </div>

            <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold">{reserva.clienteNombre}</p>
                <p className="text-neutral-600">
                    {reserva.cantPersonas} personas · {reserva.canal} · {documento} {reserva.clienteDni}
                </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className={'rounded-full px-3 py-1 text-xs font-semibold ' + (BADGES[reserva.estado] ?? '')}>
                    {reserva.estado}
                </span>
                {reserva.estado === 'Pendiente' && (
                    <button
                        type="button"
                        disabled={ocupada}
                        onClick={() => onAccion(reserva, 'confirmar')}
                        className={boton + ' bg-marino-900 text-white hover:bg-marino-700'}
                    >
                        Confirmar
                    </button>
                )}
                {activa && (
                    <button
                        type="button"
                        disabled={ocupada}
                        onClick={() => onAccion(reserva, 'atender')}
                        className={boton + ' bg-lavanda text-marino-900 hover:brightness-110'}
                    >
                        Atender
                    </button>
                )}
                {activa && (
                    <button
                        type="button"
                        disabled={ocupada}
                        onClick={() => onAccion(reserva, 'cancelar')}
                        className={boton + ' border border-red-300 text-red-700 hover:bg-red-50'}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </motion.article>
    )
}