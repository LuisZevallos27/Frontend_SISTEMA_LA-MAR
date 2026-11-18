import { useMemo, useState } from 'react'
import {
    Boxes,
    CalendarDays,
    ClipboardList,
    Clock,
    LayoutGrid,
    Receipt,
    TrendingUp,
    Trophy,
    Truck,
    UtensilsCrossed,
    Users,
    Wallet,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import NumeroAnimado from '../components/NumeroAnimado'
import Pestanas from '../components/Pestanas'
import { Panel, TarjetaKpi } from '../components/dashboard/Panel'
import {
    AnilloOcupacion,
    DonutCategorias,
    Sparkline,
    VentasPorDia,
    VentasPorHora,
} from '../components/dashboard/Graficos'
import { InsumosBajos, OrdenesPendientes, Ranking, ReservasHoy } from '../components/dashboard/Listas'
import MapaMesas from '../components/dashboard/MapaMesas'
import useDashboard from '../hooks/useDashboard'
import { fechaLarga, hoyISO } from '../utils/fechas'
import { soles } from '../utils/formato'

const PERIODOS = [7, 14, 30, 90].map((n) => ({ valor: n, etiqueta: `${n} días` }))

function saludo() {
    const hora = Number(
        new Intl.DateTimeFormat('es-PE', { hour: 'numeric', hourCycle: 'h23', timeZone: 'America/Lima' }).format(
            new Date(),
        ),
    )
    return hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
}

function Variacion({ hoy }) {
    if (hoy.variacionPct == null) {
        return <span>Ayer a esta hora: {soles(hoy.ventasAyerMismaHora)}</span>
    }
    const sube = Number(hoy.variacionPct) >= 0
    return (
        <span className={sube ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
            {sube ? '▲' : '▼'} {Math.abs(Number(hoy.variacionPct)).toFixed(1)} % vs ayer a esta hora
        </span>
    )
}

function Estadistica({ etiqueta, valor, detalle }) {
    return (
        <div className="min-w-0 rounded-xl bg-neutral-50 px-3 py-2">
            <p className="text-xs text-neutral-500">{etiqueta}</p>
            <p className="break-words text-base font-bold text-marino-900 sm:text-lg">{valor}</p>
            {detalle && <p className="text-xs text-neutral-500">{detalle}</p>}
        </div>
    )
}

function Esqueleto() {
    return (
        <div className="animate-pulse space-y-4" aria-label="Cargando dashboard">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-36 rounded-2xl bg-white/70" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="h-80 rounded-2xl bg-white/70 lg:col-span-2" />
                <div className="h-80 rounded-2xl bg-white/70" />
            </div>
        </div>
    )
}

export default function Dashboard() {
    const { sesion } = useAuth()
    const [dias, setDias] = useState(30)
    const { datos, error, recargar } = useDashboard(dias)

    const ventasPorDia = datos?.ventasPorDia
    const serieDia = useMemo(
        () => (ventasPorDia ?? []).map((v) => ({ ...v, ticket: v.pedidos ? Number(v.ventas) / v.pedidos : 0 })),
        [ventasPorDia],
    )
    const resumen = useMemo(() => {
        const lista = ventasPorDia ?? []
        const total = lista.reduce((s, v) => s + Number(v.ventas), 0)
        const completos = lista.length > 1 ? lista.slice(0, -1) : lista // el promedio no cuenta el día de hoy, que va a medias
        const promedio = completos.length ? completos.reduce((s, v) => s + Number(v.ventas), 0) / completos.length : 0
        const mejor = lista.reduce((m, v) => (Number(v.ventas) > Number(m?.ventas ?? -1) ? v : m), null)
        return { total, promedio, mejor }
    }, [ventasPorDia])

    const periodoActual = datos?.dias === dias
    const hayVentas = resumen.total > 0
    const horaActual = datos ? Number(datos.generadoEn.slice(11, 13)) : null

    return (
        <div>
            <div className="relative mb-5 overflow-hidden rounded-3xl bg-linear-to-br from-marino-900 via-marino-800 to-marino-700 p-5 text-white shadow-elevada sm:p-6">
                <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-lavanda/25 blur-3xl" />
                <div className="relative flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm text-slate-300">{fechaLarga(hoyISO())}</p>
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {saludo()}, {sesion?.nombres}
                        </h1>
                        <p className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                            <span
                                className={
                                    'inline-block h-2.5 w-2.5 rounded-full ' + (error ? 'bg-amber-400' : 'animate-pulse bg-green-400')
                                }
                            />
                            {datos ? `Actualizado a las ${datos.generadoEn.slice(11, 19)}` : 'Conectando…'} · se actualiza cada 10 s
                        </p>
                    </div>
                    <Pestanas oscuro etiqueta="Período" opciones={PERIODOS} valor={dias} onCambiar={setDias} />
                </div>
            </div>

            {error && datos && (
                <p role="alert" className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
                    Sin conexión con el servidor: se muestran los últimos datos recibidos.
                </p>
            )}
            {error && !datos && (
                <div role="alert" className="rounded-2xl bg-white p-8 text-center shadow-tarjeta">
                    <p className="mb-3 text-red-700">{error}</p>
                    <button
                        type="button"
                        onClick={recargar}
                        className="rounded-full bg-lavanda px-5 py-2 font-semibold text-marino-900 hover:brightness-110"
                    >
                        Reintentar
                    </button>
                </div>
            )}
            {!datos && !error && <Esqueleto />}

            {datos && (
                <div className={'space-y-4 transition-opacity ' + (periodoActual ? '' : 'opacity-60')}>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <TarjetaKpi
                            titulo="Ventas de hoy"
                            Icono={Wallet}
                            tono="lavanda"
                            pie={<Variacion hoy={datos.hoy} />}
                            grafico={<Sparkline serie={serieDia} clave="ventas" color="#8b8bff" id="ventas" />}
                        >
                            <NumeroAnimado valor={datos.hoy.ventas} decimales={2} prefijo="S/ " />
                        </TarjetaKpi>
                        <TarjetaKpi
                            titulo="Pedidos cerrados"
                            Icono={Receipt}
                            tono="verde"
                            pie={`${datos.hoy.pedidosAnulados} anulados hoy`}
                            grafico={<Sparkline serie={serieDia} clave="pedidos" color="#22c55e" id="pedidos" />}
                        >
                            <NumeroAnimado valor={datos.hoy.pedidosCerrados} />
                        </TarjetaKpi>
                        <TarjetaKpi
                            titulo="Ticket promedio"
                            Icono={TrendingUp}
                            tono="marino"
                            pie="Por pedido cerrado"
                            grafico={<Sparkline serie={serieDia} clave="ticket" color="#0b2d52" id="ticket" />}
                        >
                            <NumeroAnimado valor={datos.hoy.ticketPromedio} decimales={2} prefijo="S/ " />
                        </TarjetaKpi>
                        <TarjetaKpi
                            titulo="Pedidos abiertos"
                            Icono={ClipboardList}
                            tono="ambar"
                            pie={`Por cobrar ${soles(datos.hoy.porCobrar)}`}
                        >
                            <NumeroAnimado valor={datos.hoy.pedidosAbiertos} />
                        </TarjetaKpi>
                        <TarjetaKpi
                            titulo="Ocupación"
                            Icono={LayoutGrid}
                            tono="marino"
                            visual={<AnilloOcupacion porcentaje={datos.ocupacion.porcentaje} />}
                            pie={`${datos.ocupacion.ocupadas} de ${datos.ocupacion.total} mesas · ${datos.ocupacion.reservadas} reservadas`}
                        >
                            <NumeroAnimado valor={datos.ocupacion.porcentaje} sufijo="%" />
                        </TarjetaKpi>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <Panel
                            titulo="Ventas por día"
                            subtitulo={`Últimos ${datos.dias} días · con IGV`}
                            Icono={TrendingUp}
                            className="lg:col-span-2"
                        >
                            <div className="mb-3 grid grid-cols-3 gap-3">
                                <Estadistica etiqueta="Total del período" valor={soles(resumen.total)} />
                                <Estadistica etiqueta="Promedio diario" valor={soles(resumen.promedio)} />
                                <Estadistica
                                    etiqueta="Mejor día"
                                    valor={resumen.mejor ? soles(resumen.mejor.ventas) : '-'}
                                    detalle={resumen.mejor ? resumen.mejor.dia.slice(8, 10) + '/' + resumen.mejor.dia.slice(5, 7) : ''}
                                />
                            </div>
                            {hayVentas ? (
                                <VentasPorDia serie={datos.ventasPorDia} promedio={resumen.promedio} />
                            ) : (
                                <p className="py-16 text-center text-neutral-500">Aún no hay ventas en este período.</p>
                            )}
                        </Panel>
                        <Panel
                            titulo="Mesas en vivo"
                            subtitulo={`${datos.ocupacion.ocupadas} ocupadas · ${datos.ocupacion.reservadas} reservadas · ${datos.ocupacion.disponibles} libres`}
                            Icono={LayoutGrid}
                        >
                            <MapaMesas mesas={datos.mesas} />
                        </Panel>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <Panel
                            titulo="Ventas por hora"
                            subtitulo="Hoy frente al promedio de los días anteriores"
                            Icono={Clock}
                            className="lg:col-span-2"
                        >
                            <VentasPorHora serie={datos.ventasPorHora} horaActual={horaActual} />
                        </Panel>
                        <Panel titulo="Ventas por categoría" subtitulo="Sin IGV" Icono={UtensilsCrossed}>
                            {datos.categorias.length === 0 ? (
                                <p className="py-10 text-center text-sm text-neutral-500">Aún no hay datos en este período.</p>
                            ) : (
                                <DonutCategorias categorias={datos.categorias} />
                            )}
                        </Panel>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <Panel titulo="Platos más vendidos" subtitulo="Por unidades" Icono={Trophy}>
                            <Ranking
                                filas={datos.topPlatos.map((p) => ({
                                    clave: p.id,
                                    etiqueta: p.nombre,
                                    valor: p.unidades,
                                    texto: `${p.unidades} uds`,
                                    detalle: `${p.categoria} · ${soles(p.ventas)}`,
                                }))}
                            />
                        </Panel>
                        <Panel titulo="Ventas por mozo" subtitulo="Con IGV" Icono={Users}>
                            <Ranking
                                filas={datos.mozos.map((m) => ({
                                    clave: m.id,
                                    etiqueta: m.nombre,
                                    valor: Number(m.ventas),
                                    texto: soles(m.ventas),
                                    detalle: `${m.pedidos} pedidos`,
                                }))}
                            />
                        </Panel>
                        <Panel titulo="Reservas de hoy" subtitulo={`${datos.reservas.total} en total`} Icono={CalendarDays}>
                            <ReservasHoy reservas={datos.reservas} />
                        </Panel>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <Panel
                            titulo="Órdenes de compra pendientes"
                            subtitulo={`${datos.compras.ordenesPendientes} órdenes · ${soles(datos.compras.montoPendiente)}`}
                            Icono={Truck}
                        >
                            <OrdenesPendientes compras={datos.compras} />
                        </Panel>
                        <Panel
                            titulo="Insumos por reponer"
                            subtitulo="Se acabarían en menos de 3 días, según el consumo de la última semana"
                            Icono={Boxes}
                        >
                            <InsumosBajos compras={datos.compras} />
                        </Panel>
                    </div>
                </div>
            )}
        </div>
    )
}