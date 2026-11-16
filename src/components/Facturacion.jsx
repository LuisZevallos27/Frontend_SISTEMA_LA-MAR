import { useState } from 'react'
import { useNavigate } from 'react-router'
import usePrecuenta, { paramsPropina } from '../hooks/usePrecuenta'
import ClientePedido from './ClientePedido'
import Ticket from './Ticket'

const PORCENTAJES = [5, 10, 15]
const tarjeta = 'rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5'

export default function Facturacion({ pedido, ocupado, onAsignarCliente, onCerrar }) {
    const navigate = useNavigate()
    const [propina, setPropina] = useState({ tipo: 'ninguna', valor: 0 })
    const [monto, setMonto] = useState('')
    const [comprobante, setComprobante] = useState('Boleta')
    const { precuenta, error } = usePrecuenta(pedido.id, propina, `${pedido.total}-${pedido.clienteDni}`)

    const sinPlatos = pedido.items.length === 0
    const facturaInvalida = comprobante === 'Factura' && pedido.clienteDni?.length !== 11
    const noPuedeCerrar = ocupado || sinPlatos || facturaInvalida

    function sinPropina() {
        setMonto('')
        setPropina({ tipo: 'ninguna', valor: 0 })
    }

    function elegirPorcentaje(p) {
        setMonto('')
        const yaActivo = propina.tipo === 'pct' && propina.valor === p
        setPropina(yaActivo ? { tipo: 'ninguna', valor: 0 } : { tipo: 'pct', valor: p })
    }

    function cambiarMonto(texto) {
        setMonto(texto)
        const v = parseFloat(texto)
        setPropina(v > 0 ? { tipo: 'monto', valor: v } : { tipo: 'ninguna', valor: 0 })
    }

    async function cerrar() {
        if (!window.confirm('¿Cerrar la cuenta? La mesa quedará disponible.')) return
        const ok = await onCerrar(comprobante)
        if (ok) {
            const consulta = new URLSearchParams(paramsPropina(propina)).toString()
            navigate(`/comprobante/${pedido.id}${consulta ? `?${consulta}` : ''}`, { replace: true })
        }
    }

    const chip = (activo) =>
        'rounded-full px-4 py-2 text-sm font-semibold transition-colors ' +
        (activo ? 'bg-marino-900 text-white' : 'bg-neutral-100 text-marino-900 hover:bg-neutral-200')

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)]">
            <div className="space-y-4 print:hidden">
                <section className={tarjeta}>
                    <h2 className="mb-3 text-lg font-bold text-marino-900">Cliente</h2>
                    <ClientePedido pedido={pedido} onAsignar={onAsignarCliente} />
                </section>

                <section className={tarjeta}>
                    <h2 className="mb-3 text-lg font-bold text-marino-900">Comprobante</h2>
                    <div className="flex gap-2">
                        {['Boleta', 'Factura'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                aria-pressed={comprobante === t}
                                onClick={() => setComprobante(t)}
                                className={chip(comprobante === t) + ' flex-1'}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    {facturaInvalida && (
                        <p className="mt-2 text-sm text-amber-700">La factura requiere un cliente con RUC (11 dígitos).</p>
                    )}
                </section>

                <section className={tarjeta}>
                    <h2 className="mb-3 text-lg font-bold text-marino-900">Propina (extras)</h2>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={sinPropina} className={chip(propina.tipo === 'ninguna')}>
                            Sin propina
                        </button>
                        {PORCENTAJES.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => elegirPorcentaje(p)}
                                className={chip(propina.tipo === 'pct' && propina.valor === p)}
                            >
                                {p}%
                            </button>
                        ))}
                    </div>
                    <div className="mt-3">
                        <label htmlFor="monto-propina" className="mb-1 block text-sm text-neutral-600">
                            Otro monto (S/)
                        </label>
                        <input
                            id="monto-propina"
                            type="number"
                            min="0"
                            step="0.5"
                            inputMode="decimal"
                            value={monto}
                            onChange={(e) => cambiarMonto(e.target.value)}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda"
                        />
                    </div>
                </section>
            </div>

            <div>
                {error && (
                    <p role="alert" className="mb-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 print:hidden">
                        {error}
                    </p>
                )}
                {precuenta ? (
                    <Ticket cuenta={precuenta} />
                ) : (
                    !error && <p className="text-neutral-600">Calculando la cuenta…</p>
                )}

                <div className="mt-4 flex flex-col gap-2 sm:flex-row print:hidden">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        disabled={!precuenta}
                        className="flex-1 rounded-full border border-marino-900 px-5 py-3 font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white disabled:opacity-50"
                    >
                        Imprimir pre-cuenta
                    </button>
                    <button
                        type="button"
                        onClick={cerrar}
                        disabled={noPuedeCerrar}
                        className="flex-1 rounded-full bg-lavanda px-5 py-3 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110 disabled:opacity-50"
                    >
                        Cerrar cuenta
                    </button>
                </div>
                {sinPlatos && (
                    <p className="mt-2 text-sm text-neutral-600 print:hidden">
                        Agrega platos en la pestaña Orden para poder cerrar la cuenta.
                    </p>
                )}
            </div>
        </div>
    )
}