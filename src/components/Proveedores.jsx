import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import useLista from '../hooks/useLista'

const campo =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda disabled:bg-neutral-100 disabled:text-neutral-500'

export default function Proveedores() {
    const { datos, error, recargar } = useLista('/proveedores')
    const [form, setForm] = useState(null) // null: cerrado. { id: null | número, ruc, razonSocial, telefono }
    const [errorForm, setErrorForm] = useState('')
    const [guardando, setGuardando] = useState(false)

    const editando = form?.id != null
    const valido = form && form.razonSocial.trim() !== '' && (editando || /^\d{11}$/.test(form.ruc))

    function abrirNuevo() {
        setErrorForm('')
        setForm({ id: null, ruc: '', razonSocial: '', telefono: '' })
    }

    function abrirEditar(p) {
        setErrorForm('')
        setForm({ id: p.id, ruc: p.ruc, razonSocial: p.razonSocial, telefono: p.telefono ?? '' })
    }

    const actualizar = (clave) => (e) => setForm({ ...form, [clave]: e.target.value })

    async function guardar(e) {
        e.preventDefault()
        setErrorForm('')
        setGuardando(true)
        try {
            const cuerpo = { razonSocial: form.razonSocial.trim(), telefono: form.telefono.trim() || null }
            if (editando) await api.put(`/proveedores/${form.id}`, cuerpo)
            else await api.post('/proveedores', { ruc: form.ruc, ...cuerpo })
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
            <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-neutral-600">{datos ? `${datos.length} proveedores registrados` : ''}</p>
                <button
                    type="button"
                    onClick={() => (form ? setForm(null) : abrirNuevo())}
                    className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110"
                >
                    {form ? 'Cerrar formulario' : '+ Nuevo proveedor'}
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
                                {editando ? 'Editar proveedor' : 'Nuevo proveedor'}
                            </h2>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                    <label htmlFor="prov-ruc" className="mb-1 block text-sm text-neutral-600">
                                        RUC
                                    </label>
                                    <input
                                        id="prov-ruc"
                                        required
                                        disabled={editando}
                                        inputMode="numeric"
                                        maxLength={11}
                                        value={form.ruc}
                                        onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, '') })}
                                        placeholder="11 dígitos"
                                        className={campo}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prov-razon" className="mb-1 block text-sm text-neutral-600">
                                        Razón social
                                    </label>
                                    <input
                                        id="prov-razon"
                                        required
                                        maxLength={100}
                                        value={form.razonSocial}
                                        onChange={actualizar('razonSocial')}
                                        className={campo}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="prov-tel" className="mb-1 block text-sm text-neutral-600">
                                        Teléfono (opcional)
                                    </label>
                                    <input
                                        id="prov-tel"
                                        inputMode="tel"
                                        maxLength={15}
                                        value={form.telefono}
                                        onChange={actualizar('telefono')}
                                        className={campo}
                                    />
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
                                    {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar proveedor'}
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
            {datos === null && !error && <p className="text-neutral-600">Cargando proveedores…</p>}

            {datos && (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-tarjeta ring-1 ring-black/5">
                    <table className="w-full min-w-[520px] text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500">
                                <th className="px-4 py-3 font-semibold">Razón social</th>
                                <th className="px-4 py-3 font-semibold">RUC</th>
                                <th className="px-4 py-3 font-semibold">Teléfono</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {datos.map((p) => (
                                <tr key={p.id} className="border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50">
                                    <td className="px-4 py-3 font-medium">{p.razonSocial}</td>
                                    <td className="px-4 py-3">{p.ruc}</td>
                                    <td className="px-4 py-3">{p.telefono ?? '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => abrirEditar(p)}
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