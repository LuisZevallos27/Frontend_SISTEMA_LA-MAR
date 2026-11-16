import { useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'

const VACIO = { nombres: '', apellidos: '', telefono: '', correo: '' }
const DOC_VALIDO = /^(\d{8}|\d{11})$/
const campo =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda'

// Busca un cliente por DNI/RUC y, si no existe, permite registrarlo.
// onSeleccionar(cliente) puede devolver false para indicar que no se pudo usar.
export default function SelectorCliente({
    onSeleccionar,
    onCancelar,
    ayuda = 'Busca por DNI o RUC:',
}) {
    const [doc, setDoc] = useState('')
    const [registrando, setRegistrando] = useState(false)
    const [form, setForm] = useState(VACIO)
    const [error, setError] = useState('')
    const [trabajando, setTrabajando] = useState(false)

    const esEmpresa = doc.length === 11

    function reiniciar() {
        setDoc('')
        setForm(VACIO)
        setRegistrando(false)
        setError('')
    }

    async function elegir(cliente) {
        const ok = await onSeleccionar(cliente)
        if (ok !== false) reiniciar()
    }

    async function buscar(e) {
        e.preventDefault()
        setError('')
        if (!DOC_VALIDO.test(doc)) {
            setError('Ingresa un DNI (8 dígitos) o un RUC (11 dígitos)')
            return
        }
        setTrabajando(true)
        try {
            const { data } = await api.get(`/clientes/${doc}`)
            await elegir(data)
        } catch (err) {
            if (err.response?.status === 404) setRegistrando(true)
            else setError(mensajeError(err))
        } finally {
            setTrabajando(false)
        }
    }

    async function registrar(e) {
        e.preventDefault()
        setError('')
        setTrabajando(true)
        try {
            const { data } = await api.post('/clientes', {
                dni: doc,
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                telefono: form.telefono.trim() || null,
                correo: form.correo.trim() || null,
            })
            await elegir(data)
        } catch (err) {
            setError(mensajeError(err))
        } finally {
            setTrabajando(false)
        }
    }

    const actualizar = (clave) => (e) => setForm({ ...form, [clave]: e.target.value })

    return (
        <div>
            {!registrando && (
                <form onSubmit={buscar} className="space-y-2">
                    <label htmlFor="doc-cliente" className="block text-sm text-neutral-600">
                        {ayuda}
                    </label>
                    <div className="flex gap-2">
                        <input
                            id="doc-cliente"
                            type="text"
                            inputMode="numeric"
                            maxLength={11}
                            value={doc}
                            onChange={(e) => setDoc(e.target.value.replace(/\D/g, ''))}
                            placeholder="DNI o RUC"
                            className={campo}
                        />
                        <button
                            type="submit"
                            disabled={trabajando}
                            className="shrink-0 rounded-full bg-marino-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-marino-700 disabled:opacity-50"
                        >
                            {trabajando ? '…' : 'Buscar'}
                        </button>
                        {onCancelar && (
                            <button
                                type="button"
                                onClick={onCancelar}
                                className="shrink-0 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            )}

            {registrando && (
                <form onSubmit={registrar} className="space-y-2">
                    <p className="text-sm text-neutral-700">
                        No existe un cliente con el documento <strong>{doc}</strong>. Regístralo:
                    </p>
                    <input
                        required
                        value={form.nombres}
                        onChange={actualizar('nombres')}
                        placeholder={esEmpresa ? 'Razón social' : 'Nombres'}
                        aria-label={esEmpresa ? 'Razón social' : 'Nombres'}
                        maxLength={60}
                        className={campo}
                    />
                    <input
                        required
                        value={form.apellidos}
                        onChange={actualizar('apellidos')}
                        placeholder={esEmpresa ? 'Tipo (S.A.C., E.I.R.L., ...)' : 'Apellidos'}
                        aria-label={esEmpresa ? 'Tipo de empresa' : 'Apellidos'}
                        maxLength={60}
                        className={campo}
                    />
                    <input
                        value={form.telefono}
                        onChange={actualizar('telefono')}
                        placeholder="Teléfono (opcional)"
                        inputMode="tel"
                        maxLength={15}
                        className={campo}
                    />
                    <input
                        type="email"
                        value={form.correo}
                        onChange={actualizar('correo')}
                        placeholder="Correo (opcional)"
                        maxLength={80}
                        className={campo}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={trabajando}
                            className="flex-1 rounded-full bg-marino-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-marino-700 disabled:opacity-50"
                        >
                            {trabajando ? 'Guardando…' : 'Registrar y seleccionar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setRegistrando(false)}
                            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold hover:bg-neutral-100"
                        >
                            Volver
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <p role="alert" className="mt-2 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                    {error}
                </p>
            )}
        </div>
    )
}