import { useMemo } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ReferenceLine,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { soles } from '../../utils/formato'

const EJE = { fontSize: 12, fill: '#6b7280' }
const corto = (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)
const COLORES = ['#0b2d52', '#8b8bff', '#22c55e', '#e69a00', '#b91c1c', '#14b8a6', '#f472b6', '#64748b']

function TooltipTarjeta({ active, payload, label, titulo, formato }) {
    if (!active || !payload?.length) return null
    return (
        <div className="rounded-xl bg-marino-900/95 px-3 py-2 text-xs text-white shadow-elevada">
            <p className="mb-1 font-semibold">{titulo(label)}</p>
            {payload.map((p) => (
                <p key={p.dataKey} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    {p.name}: <b>{formato(p.value)}</b>
                </p>
            ))}
        </div>
    )
}

export function VentasPorDia({ serie, promedio }) {
    const datos = useMemo(
        () => serie.map((v) => ({ ...v, etiqueta: v.dia.slice(8, 10) + '/' + v.dia.slice(5, 7) })),
        [serie],
    )
    return (
        <AreaChart
            data={datos}
            responsive
            style={{ width: '100%', height: 260 }}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
            <defs>
                <linearGradient id="gradVentasDia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b8bff" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#8b8bff" stopOpacity={0.02} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="etiqueta" tick={EJE} tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis tick={EJE} tickLine={false} axisLine={false} width={44} tickFormatter={corto} />
            <Tooltip content={(p) => <TooltipTarjeta {...p} titulo={(l) => `Día ${l}`} formato={soles} />} />
            {promedio > 0 && (
                <ReferenceLine
                    y={promedio}
                    stroke="#94a3b8"
                    strokeDasharray="4 4"
                    label={{ value: 'Promedio', position: 'insideTopRight', fontSize: 11, fill: '#64748b' }}
                />
            )}
            <Area
                type="monotone"
                dataKey="ventas"
                name="Ventas"
                stroke="#5b5bd6"
                strokeWidth={2.5}
                fill="url(#gradVentasDia)"
            />
        </AreaChart>
    )
}

export function VentasPorHora({ serie, horaActual }) {
    const datos = useMemo(() => serie.map((v) => ({ ...v, etiqueta: `${v.hora}h` })), [serie])
    return (
        <ComposedChart
            data={datos}
            responsive
            style={{ width: '100%', height: 260 }}
            margin={{ top: 16, right: 8, left: 0, bottom: 0 }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="etiqueta" tick={EJE} tickLine={false} axisLine={false} />
            <YAxis tick={EJE} tickLine={false} axisLine={false} width={44} tickFormatter={corto} />
            <Tooltip content={(p) => <TooltipTarjeta {...p} titulo={(l) => `Hora ${l}`} formato={soles} />} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {horaActual != null && datos.some((d) => d.hora === horaActual) && (
                <ReferenceLine
                    x={`${horaActual}h`}
                    stroke="#8b8bff"
                    strokeDasharray="4 4"
                    label={{ value: 'Ahora', position: 'top', fontSize: 11, fill: '#5b5bd6' }}
                />
            )}
            <Bar dataKey="ventas" name="Hoy" fill="#8b8bff" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Line
                type="monotone"
                dataKey="promedio"
                name="Promedio diario"
                stroke="#0b2d52"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
            />
        </ComposedChart>
    )
}

// Mini gráfica de los últimos 7 días completos (sin contar hoy)
export function Sparkline({ serie, clave, color = '#8b8bff', id }) {
    const datos = useMemo(() => serie.slice(-8, -1), [serie])
    if (datos.length < 2) return null
    return (
        <AreaChart
            data={datos}
            responsive
            style={{ width: '100%', height: 44 }}
            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
            <defs>
                <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
            </defs>
            <Area
                type="monotone"
                dataKey={clave}
                stroke={color}
                strokeWidth={2}
                fill={`url(#spark-${id})`}
                isAnimationActive={false}
            />
        </AreaChart>
    )
}

export function AnilloOcupacion({ porcentaje }) {
    const r = 18
    const c = 2 * Math.PI * r
    const color = porcentaje >= 80 ? '#b91c1c' : porcentaje >= 50 ? '#e69a00' : '#22c55e'
    return (
        <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0 -rotate-90" aria-hidden="true">
            <circle cx="22" cy="22" r={r} fill="none" stroke="#eef2f8" strokeWidth="5" />
            <circle
                cx="22"
                cy="22"
                r={r}
                fill="none"
                stroke={color}
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                    strokeDasharray: `${(porcentaje / 100) * c} ${c}`,
                    transition: 'stroke-dasharray 0.6s ease, stroke 0.3s',
                }}
            />
        </svg>
    )
}

const R = 40
const C = 2 * Math.PI * R

export function DonutCategorias({ categorias }) {
    const total = categorias.reduce((suma, c) => suma + Number(c.ventas), 0)
    const segmentos = categorias.reduce((acc, c, i) => {
        const inicio = acc.length ? acc[acc.length - 1].inicio + acc[acc.length - 1].largo : 0
        const largo = total > 0 ? (Number(c.ventas) / total) * C : 0
        acc.push({ ...c, inicio, largo, color: COLORES[i % COLORES.length] })
        return acc
    }, [])

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-40 w-40 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={R} fill="none" stroke="#eef2f8" strokeWidth="14" />
                    {segmentos.map((s) => (
                        <circle
                            key={s.nombre}
                            cx="50"
                            cy="50"
                            r={R}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="14"
                            style={{
                                strokeDasharray: `${s.largo} ${C - s.largo}`,
                                strokeDashoffset: -s.inicio,
                                transition: 'stroke-dasharray 0.6s ease, stroke-dashoffset 0.6s ease',
                            }}
                        />
                    ))}
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                        <p className="text-[11px] text-neutral-500">Total</p>
                        <p className="text-sm font-bold text-marino-900">{soles(total)}</p>
                    </div>
                </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-1.5 self-stretch text-sm">
                {segmentos.map((s) => (
                    <li key={s.nombre} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-2">
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="truncate">{s.nombre}</span>
                        </span>
                        <span className="shrink-0 text-neutral-600">
                            {total > 0 ? Math.round((Number(s.ventas) / total) * 100) : 0}%
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}