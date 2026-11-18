import { motion } from 'motion/react'
import { fechaHoraCorta } from '../../utils/fechas'
import { cantidad, soles } from '../../utils/formato'

// filas: [{ clave, etiqueta, valor (largo de la barra), texto, detalle? }]
export function Ranking({ filas, vacio = 'Aún no hay datos en este período.' }) {
    if (filas.length === 0) return <p className="py-6 text-center text-sm text-neutral-500">{vacio}</p>
    const max = Math.max(...filas.map((f) => f.valor), 1)

    return (
        <ol className="space-y-3">
            {filas.map((f, i) => (
                <li key={f.clave}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate font-medium">
                            <span className="mr-2 text-neutral-400">{i + 1}</span>
                            {f.etiqueta}
                        </span>
                        <span className="shrink-0 font-semibold">{f.texto}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                        <motion.div
                            className="h-full rounded-full bg-linear-to-r from-marino-800 to-lavanda"
                            initial={false}
                            animate={{ width: `${(f.valor / max) * 100}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    {f.detalle && <p className="mt-0.5 text-xs text-neutral-500">{f.detalle}</p>}
                </li>
            ))}
        </ol>
    )
}

const BADGES = {
    Pendiente: 'bg-amber-100 text-amber-800',
    Confirmada: 'bg-blue-100 text-blue-800',
    Atendida: 'bg-green-100 text-green-800',
    Cancelada: 'bg-neutral-200 text-neutral-600',
}

export function ReservasHoy({ reservas }) {
    return (
        <div>
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
                {['pendientes', 'confirmadas', 'atendidas', 'canceladas'].map((k) => (
                    <span key={k} className="rounded-full bg-neutral-100 px-2.5 py-1 font-medium text-neutral-700">
                        {reservas[k]} {k}
                    </span>
                ))}
            </div>

            {reservas.lista.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">No hay reservas para hoy.</p>
            ) : (
                <ul className="max-h-72 divide-y divide-neutral-100 overflow-y-auto pr-1">
                    {reservas.lista.map((r) => (
                        <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                            <span className="w-12 shrink-0 text-lg font-bold text-marino-900">{r.hora?.slice(0, 5)}</span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">{r.cliente}</p>
                                <p className="text-xs text-neutral-500">
                                    Mesa {String(r.numeroMesa).padStart(3, '0')} · {r.personas} personas · {r.canal}
                                </p>
                            </div>
                            <span className={'rounded-full px-2 py-0.5 text-xs font-semibold ' + (BADGES[r.estado] ?? '')}>
                                {r.estado}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            {reservas.mananaActivas > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                    Mañana hay {reservas.mananaActivas} {reservas.mananaActivas === 1 ? 'reserva activa' : 'reservas activas'}.
                </p>
            )}
        </div>
    )
}

export function OrdenesPendientes({ compras }) {
    if (compras.pendientes.length === 0) {
        return <p className="py-6 text-center text-sm text-neutral-500">No hay órdenes pendientes.</p>
    }
    return (
        <ul className="divide-y divide-neutral-100">
            {compras.pendientes.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div className="min-w-0">
                        <p className="truncate font-medium">
                            #{o.id} · {o.proveedor}
                        </p>
                        <p className="text-xs text-neutral-500">Pedida el {fechaHoraCorta(o.fecha)}</p>
                    </div>
                    <span className="shrink-0 font-semibold">{soles(o.monto)}</span>
                </li>
            ))}
        </ul>
    )
}

const NIVELES = [
    { max: 1, etiqueta: 'Crítico', badge: 'bg-red-100 text-red-700', barra: 'bg-red-500' },
    { max: 2, etiqueta: 'Bajo', badge: 'bg-amber-100 text-amber-700', barra: 'bg-amber-500' },
    { max: 3, etiqueta: 'Atención', badge: 'bg-yellow-100 text-yellow-700', barra: 'bg-yellow-400' },
]
const nivelDe = (dias) => NIVELES.find((n) => dias < n.max) ?? NIVELES[NIVELES.length - 1]

function cobertura(dias) {
    if (dias <= 0) return 'Agotado'
    if (dias < 1) return `Alcanza ~${Math.max(1, Math.round(dias * 24))} h`
    return `Alcanza ~${dias.toFixed(1)} días`
}

export function InsumosBajos({ compras }) {
    const lista = compras.insumosBajos
    if (lista.length === 0) {
        return <p className="py-6 text-center text-sm text-neutral-500">Todos los insumos tienen buena cobertura.</p>
    }
    const sinOrden = lista.filter((i) => Number(i.enCamino) <= 0).length

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                {NIVELES.map((n, k) => (
                    <span key={n.etiqueta} className={'rounded-full px-2.5 py-1 font-semibold ' + n.badge}>
                        {n.etiqueta} · {k === 0 ? 'menos de 1 día' : `${k} a ${k + 1} días`}
                    </span>
                ))}
            </div>
            {sinOrden > 0 && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {sinOrden} {sinOrden === 1 ? 'insumo no tiene' : 'insumos no tienen'} una orden de compra pendiente.
                </p>
            )}

            <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {lista.map((i) => {
                    const dias = Number(i.diasCobertura)
                    const nivel = nivelDe(dias)
                    const enCamino = Number(i.enCamino)
                    return (
                        <li key={i.id} className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <p className="min-w-0 truncate font-semibold">{i.nombre}</p>
                                <span className={'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ' + nivel.badge}>
                                    {nivel.etiqueta}
                                </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 text-sm">
                                <span>
                                    Quedan{' '}
                                    <b>
                                        {cantidad(i.stock)} {i.unidad}
                                    </b>
                                </span>
                                <span className="font-semibold">{cobertura(dias)}</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200" aria-hidden="true">
                                <div
                                    className={'h-full rounded-full transition-all duration-500 ' + nivel.barra}
                                    style={{ width: `${Math.max(4, Math.min(100, (dias / 3) * 100))}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-neutral-500">
                                Consumo: {cantidad(i.consumoDiario)} {i.unidad} por día
                            </p>
                            {enCamino > 0 ? (
                                <p className="mt-1 text-xs font-medium text-green-700">
                                    ✔ En camino: +{cantidad(enCamino)} {i.unidad} (orden pendiente)
                                </p>
                            ) : (
                                <p className="mt-1 text-xs font-medium text-red-600">✖ Sin orden de compra pendiente</p>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}