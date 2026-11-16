import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import useLista from '../hooks/useLista'
import { soles } from '../utils/formato'

const campo =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda'

const nuevaLinea = () => ({ clave: crypto.randomUUID(), idInsumo: '', cantidad: '', costoUnitario: '' })

// Subtotal de una linea: cantidad x costo unitario, redondeado a 2 decimales
function subtotal(l) {
    const cant = parseFloat(l.cantidad)
    const unit = parseFloat(l.costoUnitario)
    if (!(cant > 0) || !(unit >= 0)) return 0
    return Math.round((cant * unit + Number.EPSILON) * 100) / 100
}

export default function FormularioOrden({ onCreada, onCancelar }) {
    const proveedores = useLista('/proveedores')
    const insumos = useLista('/insumos')
    const [idProveedor, setIdProveedor] = useState('')
    const [lineas, setLineas] = useState(() => [nuevaLinea()])
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const catalogo = insumos.datos ?? []
    const elegidos = lineas.map((l) => l.idInsumo)
    const total = lineas.reduce((suma, l) => suma + subtotal(l), 0)
    const valida =
        idProveedor !== '' &&
        lineas.length > 0 &&
        lineas.every(
            (l) => l.idInsumo !== '' && parseFloat(l.cantidad) > 0 && l.costoUnitario !== '' && parseFloat(l.costoUnitario) >= 0,
        )

    const cambiar = (clave, nombre, valor) =>
        setLineas(lineas.map((l) => (l.clave === clave ? { ...l, [nombre]: valor } : l)))

    async function enviar(e) {
        e.preventDefault()
        setError('')
        setGuardando(true)
        try {
            const { data } = await api.post('/abastecimientos', {
                idProveedor: Number(idProveedor),
                items: lineas.map((l) => ({
                    idInsumo: Number(l.idInsumo),
                    cantidad: parseFloat(l.cantidad),
                    costoTotal: subtotal(l),
                })),
            })
            onCreada(data)
        } catch (err) {
            setError(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <form onSubmit={enviar} className="rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5">
            <h2 className="mb-3 text-lg font-bold text-marino-900">Nueva orden de compra</h2>

            <div className="mb-4 max-w-md">
                <label htmlFor="orden-proveedor" className="mb-1 block text-sm text-neutral-600">
                    Proveedor
                </label>
                <select
                    id="orden-proveedor"
                    required
                    value={idProveedor}
                    onChange={(e) => setIdProveedor(e.target.value)}
                    className={campo}
                >
                    <option value="">Elegir…</option>
                    {(proveedores.datos ?? []).map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.razonSocial} · RUC {p.ruc}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative space-y-2">
                <AnimatePresence mode="popLayout" initial={false}>
                    {lineas.map((l) => {
                        const insumo = catalogo.find((i) => String(i.id) === l.idInsumo)
                        const unidad = insumo?.unidadMedida
                        return (
                            <motion.div
                                key={l.clave}
                                layout
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.18 }}
                                className="grid grid-cols-2 gap-2 rounded-xl bg-neutral-50 p-3 sm:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_auto] sm:items-end"
                            >
                                <div className="col-span-2 sm:col-span-1">
                                    <label className="mb-1 block text-xs text-neutral-500" htmlFor={`ins-${l.clave}`}>
                                        Insumo
                                    </label>
                                    <select
                                        id={`ins-${l.clave}`}
                                        required
                                        value={l.idInsumo}
                                        onChange={(e) => cambiar(l.clave, 'idInsumo', e.target.value)}
                                        className={campo}
                                    >
                                        <option value="">Elegir…</option>
                                        {catalogo
                                            .filter((i) => String(i.id) === l.idInsumo || !elegidos.includes(String(i.id)))
                                            .map((i) => (
                                                <option key={i.id} value={i.id}>
                                                    {i.nombre} ({i.unidadMedida})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-neutral-500" htmlFor={`cant-${l.clave}`}>
                                        Cantidad {unidad ? `(${unidad})` : ''}
                                    </label>
                                    <input
                                        id={`cant-${l.clave}`}
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        inputMode="decimal"
                                        required
                                        value={l.cantidad}
                                        onChange={(e) => cambiar(l.clave, 'cantidad', e.target.value)}
                                        className={campo}
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs text-neutral-500" htmlFor={`unit-${l.clave}`}>
                                        Costo {unidad ? `por ${unidad}` : 'unitario'} (S/)
                                    </label>
                                    <input
                                        id={`unit-${l.clave}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        inputMode="decimal"
                                        required
                                        value={l.costoUnitario}
                                        onChange={(e) => cambiar(l.clave, 'costoUnitario', e.target.value)}
                                        className={campo}
                                    />
                                </div>
                                <div>
                                    <span className="mb-1 block text-xs text-neutral-500">Subtotal</span>
                                    <p className="rounded-lg bg-white px-3 py-2 text-sm font-semibold ring-1 ring-neutral-200">
                                        {soles(subtotal(l))}
                                    </p>
                                </div>
                                <div className="col-span-2 flex justify-end sm:col-span-1">
                                    <button
                                        type="button"
                                        disabled={lineas.length === 1}
                                        onClick={() => setLineas(lineas.filter((x) => x.clave !== l.clave))}
                                        aria-label="Quitar insumo"
                                        className="rounded-full px-3 py-2 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            <button
                type="button"
                disabled={lineas.length >= catalogo.length}
                onClick={() => setLineas([...lineas, nuevaLinea()])}
                className="mt-3 rounded-full border border-marino-900 px-4 py-2 text-sm font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white disabled:opacity-40"
            >
                + Agregar insumo
            </button>

            {(proveedores.error || insumos.error || error) && (
                <p role="alert" className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                    {error || proveedores.error || insumos.error}
                </p>
            )}

            <div className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-lg font-bold">Total: {soles(total)}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="rounded-full border border-neutral-300 px-5 py-2.5 font-semibold hover:bg-neutral-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando || !valida}
                        className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110 disabled:opacity-50"
                    >
                        {guardando ? 'Guardando…' : 'Crear orden'}
                    </button>
                </div>
            </div>
        </form>
    )
}