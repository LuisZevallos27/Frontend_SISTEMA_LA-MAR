const ZONAS = ['Piso 1', 'Piso 2', 'VIP']
const LARGA = 90 // minutos: pasada esta marca se resalta la mesa

const ESTILO = {
    Disponible: 'border-mesa-libre bg-green-50',
    Reservado: 'border-mesa-reservada bg-amber-50',
    Ocupado: 'border-mesa-ocupada bg-red-50',
}

function duracion(min) {
    if (min == null) return ''
    if (min < 60) return `${min} min`
    return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`
}

function Leyenda() {
    return (
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-mesa-libre" /> Disponible
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-mesa-reservada" /> Reservada
            </span>
            <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-mesa-ocupada" /> Ocupada
            </span>
            <span className="flex items-center gap-1.5">⏱ Más de {LARGA} min abierta</span>
        </div>
    )
}

export default function MapaMesas({ mesas }) {
    return (
        <div>
            <Leyenda />
            <div className="space-y-4">
                {ZONAS.map((zona) => {
                    const lista = mesas.filter((m) => m.zona === zona)
                    if (lista.length === 0) return null
                    return (
                        <div key={zona}>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{zona}</p>
                            <div className="grid grid-cols-4 gap-2">
                                {lista.map((m) => {
                                    const ocupada = m.estado === 'Ocupado'
                                    const larga = ocupada && (m.minutosAbierta ?? 0) >= LARGA
                                    return (
                                        <div
                                            key={m.id}
                                            title={`Mesa ${m.numero} · ${m.capacidad} personas · ${m.estado}${ocupada && m.total != null ? ` · S/ ${m.total}` : ''}`}
                                            className={
                                                'rounded-xl border-2 p-2 text-center transition-colors duration-500 ' +
                                                (ESTILO[m.estado] ?? '') +
                                                (larga ? ' ring-2 ring-amber-400' : '')
                                            }
                                        >
                                            <p className="text-lg font-bold leading-none text-neutral-900">
                                                {String(m.numero).padStart(2, '0')}
                                            </p>
                                            <p className="mt-1 text-[11px] leading-tight text-neutral-600">
                                                {ocupada && m.total != null ? `S/ ${Math.round(m.total)}` : `${m.capacidad} pers.`}
                                            </p>
                                            {ocupada && (
                                                <p className={'text-[10px] ' + (larga ? 'font-semibold text-amber-700' : 'text-neutral-500')}>
                                                    {larga && '⏱ '}
                                                    {duracion(m.minutosAbierta)}
                                                </p>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}