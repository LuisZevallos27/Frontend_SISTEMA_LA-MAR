import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import FormularioReserva from '../components/FormularioReserva'
import Pestanas from '../components/Pestanas'
import TarjetaReserva from '../components/TarjetaReserva'
import { fechaLarga, hoyISO, sumarDias } from '../utils/fechas'

const ESTADOS = ['Pendiente', 'Confirmada', 'Atendida', 'Cancelada']
const flecha =
    'h-10 w-10 rounded-full bg-white text-lg font-bold text-marino-900 shadow-tarjeta transition-colors hover:bg-neutral-100'

export default function Reservas() {
    const [fecha, setFecha] = useState(hoyISO)
    const [filtro, setFiltro] = useState('Todas')
    const [datos, setDatos] = useState({ fecha: null, lista: [] })
    const [recarga, setRecarga] = useState(0)
    const [error, setError] = useState('')
    const [accionId, setAccionId] = useState(null)
    const [mostrarForm, setMostrarForm] = useState(false)

    // Pide las reservas del dia; si se cambia de dia antes de que responda, descarta la respuesta vieja
    useEffect(() => {
        let cancelado = false
        api
            .get('/reservas', { params: { fecha } })
            .then(({ data }) => {
                if (cancelado) return
                setDatos({ fecha, lista: data })
                setError('')
            })
            .catch((e) => {
                if (!cancelado) setError(mensajeError(e, 'No se pudieron cargar las reservas'))
            })
        return () => {
            cancelado = true
        }
    }, [fecha, recarga])

    const recargar = () => setRecarga((n) => n + 1)
    const cargando = datos.fecha !== fecha && !error
    const lista = datos.fecha === fecha ? datos.lista : []
    const visibles = filtro === 'Todas' ? lista : lista.filter((r) => r.estado === filtro)
    const cuenta = (estado) => lista.filter((r) => r.estado === estado).length

    async function accion(reserva, tipo) {
        if (tipo === 'cancelar' && !window.confirm('¿Cancelar esta reserva?')) return
        setAccionId(reserva.id)
        setError('')
        try {
            await api.post(`/reservas/${reserva.id}/${tipo}`, {})
            recargar()
        } catch (e) {
            setError(mensajeError(e))
        } finally {
            setAccionId(null)
        }
    }

    function reservaCreada(r) {
        setMostrarForm(false)
        setFecha(r.fecha)
        recargar()
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-marino-900">Reservas</h1>
                    <p className="text-neutral-600">{fechaLarga(fecha)}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setMostrarForm((v) => !v)}
                    className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110"
                >
                    {mostrarForm ? 'Cerrar formulario' : '+ Nueva reserva'}
                </button>
            </div>

            <AnimatePresence initial={false}>
                {mostrarForm && (
                    <motion.div
                        key="formulario"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4">
                            <FormularioReserva
                                fechaInicial={fecha}
                                onCreada={reservaCreada}
                                onCancelar={() => setMostrarForm(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                <button type="button" aria-label="Día anterior" onClick={() => setFecha(sumarDias(fecha, -1))} className={flecha}>
                    ‹
                </button>
                <input
                    type="date"
                    aria-label="Fecha"
                    value={fecha}
                    onChange={(e) => e.target.value && setFecha(e.target.value)}
                    className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow-tarjeta outline-none focus:ring-2 focus:ring-lavanda"
                />
                <button type="button" aria-label="Día siguiente" onClick={() => setFecha(sumarDias(fecha, 1))} className={flecha}>
                    ›
                </button>
                <button
                    type="button"
                    onClick={() => setFecha(hoyISO())}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-marino-900 shadow-tarjeta transition-colors hover:bg-neutral-100"
                >
                    Hoy
                </button>
            </div>

            <div className="mb-4">
                <Pestanas
                    etiqueta="Estado de la reserva"
                    opciones={[
                        { valor: 'Todas', etiqueta: 'Todas', extra: lista.length },
                        ...ESTADOS.map((e) => ({ valor: e, etiqueta: e, extra: cuenta(e) })),
                    ]}
                    valor={filtro}
                    onCambiar={setFiltro}
                />
            </div>

            {error && (
                <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                    {error}
                </p>
            )}
            {cargando && <p className="text-neutral-600">Cargando reservas…</p>}
            {!cargando && !error && visibles.length === 0 && (
                <p className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-tarjeta">
                    {filtro === 'Todas'
                        ? 'No hay reservas para este día.'
                        : `No hay reservas con estado ${filtro.toLowerCase()} para este día.`}
                </p>
            )}

            <div className="relative space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                    {visibles.map((r) => (
                        <TarjetaReserva key={r.id} reserva={r} ocupada={accionId === r.id} onAccion={accion} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}