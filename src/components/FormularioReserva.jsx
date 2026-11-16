import { useEffect, useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import { hoyISO } from '../utils/fechas'
import SelectorCliente from './SelectorCliente'

const CANALES = ['Presencial', 'Teléfono', 'WhatsApp', 'Web']
const ZONAS = ['Piso 1', 'Piso 2', 'VIP']
const campo =
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-lavanda'

export default function FormularioReserva({ fechaInicial, onCreada, onCancelar }) {
    const [mesas, setMesas] = useState([])
    const [cliente, setCliente] = useState(null)
    const [form, setForm] = useState({
        idMesa: '',
        fecha: fechaInicial < hoyISO() ? hoyISO() : fechaInicial,
        hora: '',
        cantPersonas: 2,
        canal: 'Presencial',
    })
    const [error, setError] = useState('')
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let cancelado = false
        api
            .get('/mesas')
            .then(({ data }) => {
                if (!cancelado) setMesas(data)
            })
            .catch((e) => {
                if (!cancelado) setError(mensajeError(e, 'No se pudieron cargar las mesas'))
            })
        return () => {
            cancelado = true
        }
    }, [])

    // Solo se ofrecen las mesas con capacidad suficiente para el grupo
    const mesasOk = mesas.filter((m) => m.capacidad >= Number(form.cantPersonas || 0))
    const idValido = mesasOk.some((m) => String(m.id) === form.idMesa) ? form.idMesa : ''

    const actualizar = (clave) => (e) => setForm({ ...form, [clave]: e.target.value })

    async function enviar(e) {
        e.preventDefault()
        setError('')
        setGuardando(true)
        try {
            const { data } = await api.post('/reservas', {
                dniCliente: cliente.dni,
                idMesa: Number(idValido),
                fecha: form.fecha,
                hora: form.hora,
                cantPersonas: Number(form.cantPersonas),
                canal: form.canal,
            })
            onCreada(data)
        } catch (err) {
            setError(mensajeError(err))
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="rounded-2xl bg-white p-4 shadow-tarjeta ring-1 ring-black/5">
            <h2 className="mb-3 text-lg font-bold text-marino-900">Nueva reserva</h2>

            <div className="mb-4">
                {cliente ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 p-3">
                        <div>
                            <p className="font-semibold">
                                {cliente.nombres} {cliente.apellidos}
                            </p>
                            <p className="text-sm text-neutral-600">
                                {cliente.dni.length === 11 ? 'RUC' : 'DNI'}: {cliente.dni}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCliente(null)}
                            className="rounded-full border border-marino-900 px-4 py-1.5 text-sm font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white"
                        >
                            Cambiar
                        </button>
                    </div>
                ) : (
                    <SelectorCliente
                        ayuda="Cliente: busca por DNI o RUC"
                        onSeleccionar={(c) => {
                            setCliente(c)
                            return true
                        }}
                    />
                )}
            </div>

            <form onSubmit={enviar} className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div>
                        <label htmlFor="res-fecha" className="mb-1 block text-sm text-neutral-600">
                            Fecha
                        </label>
                        <input
                            id="res-fecha"
                            type="date"
                            required
                            min={hoyISO()}
                            value={form.fecha}
                            onChange={actualizar('fecha')}
                            className={campo}
                        />
                    </div>
                    <div>
                        <label htmlFor="res-hora" className="mb-1 block text-sm text-neutral-600">
                            Hora
                        </label>
                        <input
                            id="res-hora"
                            type="time"
                            required
                            value={form.hora}
                            onChange={actualizar('hora')}
                            className={campo}
                        />
                    </div>
                    <div>
                        <label htmlFor="res-personas" className="mb-1 block text-sm text-neutral-600">
                            Personas
                        </label>
                        <input
                            id="res-personas"
                            type="number"
                            required
                            min="1"
                            max="20"
                            value={form.cantPersonas}
                            onChange={actualizar('cantPersonas')}
                            className={campo}
                        />
                    </div>
                    <div>
                        <label htmlFor="res-mesa" className="mb-1 block text-sm text-neutral-600">
                            Mesa
                        </label>
                        <select
                            id="res-mesa"
                            required
                            value={idValido}
                            onChange={actualizar('idMesa')}
                            className={campo}
                        >
                            <option value="">Elegir…</option>
                            {ZONAS.map((z) => {
                                const delaZona = mesasOk.filter((m) => m.zona === z)
                                if (delaZona.length === 0) return null
                                return (
                                    <optgroup key={z} label={z}>
                                        {delaZona.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                Mesa {String(m.numero).padStart(3, '0')} · {m.capacidad} personas
                                            </option>
                                        ))}
                                    </optgroup>
                                )
                            })}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="res-canal" className="mb-1 block text-sm text-neutral-600">
                            Canal
                        </label>
                        <select id="res-canal" value={form.canal} onChange={actualizar('canal')} className={campo}>
                            {CANALES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <p role="alert" className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                        {error}
                    </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onCancelar}
                        className="rounded-full border border-neutral-300 px-5 py-2.5 font-semibold hover:bg-neutral-100"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={guardando || !cliente || !idValido}
                        className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110 disabled:opacity-50"
                    >
                        {guardando ? 'Guardando…' : 'Crear reserva'}
                    </button>
                </div>
                {!cliente && <p className="text-right text-xs text-neutral-500">Primero selecciona un cliente.</p>}
            </form>
        </div>
    )
}