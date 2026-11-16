import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import api from '../api/client'
import { mensajeError } from '../api/errores'
import useLista from '../hooks/useLista'
import { soles } from '../utils/formato'
import FormularioOrden from './FormularioOrden'
import Pestanas from './Pestanas'
import TarjetaOrden from './TarjetaOrden'

const ESTADOS = ['Pendiente', 'Recibido', 'Anulado']

export default function OrdenesCompra() {
    const { datos, error, recargar } = useLista('/abastecimientos')
    const [filtro, setFiltro] = useState('Todas')
    const [mostrarForm, setMostrarForm] = useState(false)
    const [accionId, setAccionId] = useState(null)
    const [errorAccion, setErrorAccion] = useState('')

    const lista = datos ?? []
    const visibles = filtro === 'Todas' ? lista : lista.filter((o) => o.estado === filtro)
    const cuenta = (estado) => lista.filter((o) => o.estado === estado).length
    const pendientes = lista.filter((o) => o.estado === 'Pendiente')
    const montoPendiente = pendientes.reduce((suma, o) => suma + Number(o.costoTotal), 0)

    async function accion(orden, tipo) {
        const aviso =
            tipo === 'recibir'
                ? '¿Marcar la orden como recibida? El stock de sus insumos aumentará.'
                : '¿Anular esta orden?'
        if (!window.confirm(aviso)) return
        setAccionId(orden.id)
        setErrorAccion('')
        try {
            await api.post(`/abastecimientos/${orden.id}/${tipo}`, {})
            recargar()
        } catch (e) {
            setErrorAccion(mensajeError(e))
        } finally {
            setAccionId(null)
        }
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-neutral-600">
                    {pendientes.length === 0
                        ? 'No hay órdenes pendientes.'
                        : `${pendientes.length} ${pendientes.length === 1 ? 'orden pendiente' : 'órdenes pendientes'} por ${soles(montoPendiente)}`}
                </p>
                <button
                    type="button"
                    onClick={() => setMostrarForm((v) => !v)}
                    className="rounded-full bg-lavanda px-5 py-2.5 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110"
                >
                    {mostrarForm ? 'Cerrar formulario' : '+ Nueva orden'}
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
                            <FormularioOrden
                                onCreada={() => {
                                    setMostrarForm(false)
                                    setFiltro('Todas')
                                    recargar()
                                }}
                                onCancelar={() => setMostrarForm(false)}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mb-4">
                <Pestanas
                    etiqueta="Estado de la orden"
                    opciones={[
                        { valor: 'Todas', etiqueta: 'Todas', extra: lista.length },
                        ...ESTADOS.map((e) => ({ valor: e, etiqueta: e, extra: cuenta(e) })),
                    ]}
                    valor={filtro}
                    onCambiar={setFiltro}
                />
            </div>

            {(error || errorAccion) && (
                <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
                    {errorAccion || error}
                </p>
            )}
            {datos === null && !error && <p className="text-neutral-600">Cargando órdenes…</p>}
            {datos && visibles.length === 0 && (
                <p className="rounded-2xl bg-white p-8 text-center text-neutral-600 shadow-tarjeta">
                    {filtro === 'Todas'
                        ? 'Aún no hay órdenes de compra.'
                        : `No hay órdenes con estado ${filtro.toLowerCase()}.`}
                </p>
            )}

            <div className="relative space-y-3">
                <AnimatePresence mode="popLayout" initial={false}>
                    {visibles.map((o) => (
                        <TarjetaOrden key={o.id} orden={o} ocupada={accionId === o.id} onAccion={accion} />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    )
}