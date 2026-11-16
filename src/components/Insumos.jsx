import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import useLista from '../hooks/useLista'
import { cantidad, normalizar } from '../utils/formato'

const campo =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda'

export default function Insumos() {
    const { datos, error, recargar } = useLista('/insumos')
    const [buscar, setBuscar] = useState('')
    const [form, setForm] = useState(null) // null: cerrado. { id: null | número, nombre, unidadMedida }
    const [errorForm, setErrorForm] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = form?.id != null
    const valido = form && form.nombre.trim() !== '' && form.unidadMedida.trim() !== ''

    const texto = normalizar(buscar.trim())
    const visibles = (datos ?? []).filter((i) => normalizar(i.nombre).includes(texto))
    const hayNegativos = (datos ?? []).some((i) => Number(i.stock) < 0)

    function abrirNuevo() {
        setErrorForm('')
        setForm({ id: null, nombre: '', unidadMedida: '' })
    }

    function abrirEditar(i) {
        setErrorForm('')
        setForm({ id: i.id, nombre: i.nombre, unidadMedida: i.unidadMedida })
    }

    const actualizar = (clave) => (e) => setForm({ ...form, [clave]: e.target.value })

    async function guardar(e) {
        e.preventDefault()
        setErrorForm('')
        setGuardando(true)
        try {
            const cuerpo = { nombre: form.nombre.trim(), unidadMedida: form.unidadMedida.trim() }
            if (editando) await api.put(`/insumos/${form.id}`, cuerpo)
            else await api.post('/insumos', cuerpo)
            setForm(null)
            recargar()
        } catch (err) {
            setErrorForm(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <input
                    type="search"
                    value={buscar}
                    onChange={(e) => setBuscar(e.target.value)}
                    placeholder="Buscar insumo…"
                    aria-label="Buscar insumo"
                    className="w-full rounded-full bg-white px-5 py-2.5 shadow-tarjeta outline-none focus:ring-2 focus:ring-lavanda sm:w-72"
                />
                <button
                    type="button"
                    onClick={() => (form ? setForm(null) : abrirNuevo())}
                    className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110"
                >
                    {form ? 'Cerrar formulario' : '+ Nuevo insumo'}
                </button>
            </div>

            <AnimatePresence initial={false}>
                {form && (
                    <motion.div
                        key="formulario"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <form
                            onSubmit={guardar}
                            className="mb-4 rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5"
                        >
                            <h2 className="mb-3 text-lg font-bold text-marino-900">
                                {editando ? 'Editar insumo' : 'Nuevo insumo'}
                            </h2>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="ins-nombre" className="mb-1 block text-sm text-neutral-600">
                                        Nombre
                                    </label>
                                    <input
                                        id="ins-nombre"
                                        required
                                        maxLength={80}
                                        value={form.nombre}
                                        onChange={actualizar('nombre')}
                                        className={campo}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ins-unidad" className="mb-1 block text-sm text-neutral-600">
                                        Unidad de medida
                                    </label>
                                    <input
                                        id="ins-unidad"
                                        required
                                        list="unidades"
                                        maxLength={15}
                                        value={form.unidadMedida}
                                        onChange={actualizar('unidadMedida')}
                                        placeholder="kg, litro, unidad…"
                                        className={campo}
                                    />
                                    <datalist id="unidades">
                                        <option value="kg" />
                                        <option value="g" />
                                        <option value="litro" />
                                        <option value="ml" />
                                        <option value="unidad" />
                                        <option value="docena" />
                                    </datalist>
                                </div>
                            </div>

                            {errorForm && (
                                <p role="alert" className="mt-3 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                                    {errorForm}
                                </p>
                            )}

                            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setForm(null)}
                                    className="rounded-full border border-neutral-300 px-5 py-2.5 font-semibold hover:bg-neutral-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando || !valido}
                                    className="rounded-full bg-marino-900 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-marino-700 disabled:opacity-50"
                                >
                                    {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar insumo'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                    {error}
                </p>
            )}
            {hayNegativos && (
                <p className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
                    Hay insumos con stock negativo: se consumió más de lo registrado en compras recibidas.
                </p>
            )}
            {datos === null && !error && <p className="text-neutral-600">Cargando insumos…</p>}
            {datos && visibles.length === 0 && <p className="text-neutral-600">No se encontraron insumos.</p>}

            {visibles.length > 0 && (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-tarjeta ring-1 ring-black/5">
                    <table className="w-full min-w-[620px] text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                                <th className="px-4 py-3 font-semibold">Insumo</th>
                                <th className="px-4 py-3 font-semibold">Unidad</th>
                                <th className="px-4 py-3 text-right font-semibold">Recibido</th>
                                <th className="px-4 py-3 text-right font-semibold">Consumido</th>
                                <th className="px-4 py-3 text-right font-semibold">Stock</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {visibles.map((i) => (
                                <tr key={i.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{i.nombre}</td>
                                    <td className="px-4 py-3">{i.unidadMedida}</td>
                                    <td className="px-4 py-3 text-right">{cantidad(i.recibido)}</td>
                                    <td className="px-4 py-3 text-right">{cantidad(i.consumido)}</td>
                                    <td
                                        className={
                                            'px-4 py-3 text-right font-semibold ' +
                                            (Number(i.stock) < 0 ? 'text-red-700' : 'text-marino-900')
                                        }
                                    >
                                        {cantidad(i.stock)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => abrirEditar(i)}
                                            className="rounded-full border border-marino-900 px-4 py-1.5 text-sm font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white"
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}