import { soles } from '../utils/formato'

// 2026-11-08 -> 08/11/26
function fechaCorta(iso) {
    if (!iso) return '-'
    const [a, m, d] = iso.split('-')
    return `${d}/${m}/${a.slice(2)}`
}

function Dato({ etiqueta, valor }) {
    return (
        <div className="flex gap-1">
            <dt className="text-neutral-500">{etiqueta}:</dt>
            <dd className="font-medium">{valor}</dd>
        </div>
    )
}

function Fila({ etiqueta, valor, fuerte = false }) {
    return (
        <div className={'flex justify-between ' + (fuerte ? 'text-base font-bold' : '')}>
            <span>{etiqueta}</span>
            <span>{valor}</span>
        </div>
    )
}

export default function Ticket({ cuenta }) {
    const cerrada = cuenta.estadoPedido === 'Cerrado'
    const titulo = !cerrada
        ? 'PRE-CUENTA'
        : cuenta.tipoComprobante === 'Factura'
            ? 'FACTURA'
            : 'BOLETA DE VENTA'
    const documento = cuenta.clienteDni?.length === 11 ? 'RUC' : 'DNI'

    return (
        <article className="mx-auto w-full max-w-md rounded-2xl bg-white p-5 font-mono text-sm shadow-tarjeta ring-1 ring-black/5 print:max-w-none print:rounded-none print:shadow-none print:ring-0">
            <div className="text-center">
                <p className="text-xl font-bold tracking-wide">LA MAR</p>
                <p className="text-xs text-neutral-500">Cevichería</p>
                <p className="mt-2 font-semibold">{titulo}</p>
                <p className="text-xs text-neutral-500">Pedido N.º {cuenta.idPedido}</p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <Dato etiqueta="Fecha" valor={fechaCorta(cuenta.fecha)} />
                <Dato etiqueta="Mesa" valor={String(cuenta.numeroMesa).padStart(3, '0')} />
                <Dato etiqueta="Hora" valor={cuenta.hora ?? '-'} />
                <Dato etiqueta="Zona" valor={cuenta.zona} />
                <div className="col-span-2">
                    <Dato etiqueta="Cliente" valor={cuenta.clienteNombre ?? 'Público general'} />
                </div>
                <div className="col-span-2">
                    <Dato etiqueta={documento} valor={cuenta.clienteDni ?? '-'} />
                </div>
                <div className="col-span-2">
                    <Dato etiqueta="Atendió" valor={cuenta.atendidoPor} />
                </div>
            </dl>

            <div className="mt-4 border-y-2 border-dashed border-neutral-300 py-2">
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-xs font-semibold text-neutral-500">
                    <span>Descripción</span>
                    <span className="text-right">Cant</span>
                    <span className="w-20 text-right">P. Total</span>
                </div>
                {cuenta.lineas.length === 0 && <p className="py-3 text-center text-neutral-500">Sin platos</p>}
                {cuenta.lineas.map((l) => (
                    <div key={l.descripcion} className="mt-1 grid grid-cols-[1fr_auto_auto] gap-x-3">
                        <span>{l.descripcion}</span>
                        <span className="text-right">{l.cantidad}</span>
                        <span className="w-20 text-right">{Number(l.total).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 space-y-1">
                <Fila etiqueta="OP. GRAVADA" valor={soles(cuenta.opGravada)} />
                <Fila etiqueta="IGV (18%)" valor={soles(cuenta.igv)} />
                <Fila etiqueta="EXTRAS" valor={soles(cuenta.propina)} />
                <div className="border-t-2 border-dashed border-neutral-300 pt-2">
                    <Fila etiqueta="TOTAL" valor={soles(cuenta.totalAPagar)} fuerte />
                </div>
            </div>

            <p className="mt-4 border-t-2 border-dashed border-neutral-300 pt-3 text-xs font-semibold">
                {cuenta.sonLetras}
            </p>
            <p className="mt-4 text-center text-xs text-neutral-500">¡Gracias por su visita!</p>
        </article>
    )
}