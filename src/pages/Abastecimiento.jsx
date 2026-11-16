import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Insumos from '../components/Insumos'
import OrdenesCompra from '../components/OrdenesCompra'
import Pestanas from '../components/Pestanas'
import Proveedores from '../components/Proveedores'

const SECCIONES = [
    { valor: 'ordenes', etiqueta: 'Órdenes de compra' },
    { valor: 'proveedores', etiqueta: 'Proveedores' },
    { valor: 'insumos', etiqueta: 'Insumos' },
]

export default function Abastecimiento() {
    const [seccion, setSeccion] = useState('ordenes')

    return (
        <div>
            <h1 className="mb-4 text-3xl font-bold text-marino-900">Abastecimiento</h1>

            <div className="mb-5">
                <Pestanas etiqueta="Secciones de abastecimiento" opciones={SECCIONES} valor={seccion} onCambiar={setSeccion} />
            </div>

            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={seccion}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    {seccion === 'ordenes' && <OrdenesCompra />}
                    {seccion === 'proveedores' && <Proveedores />}
                    {seccion === 'insumos' && <Insumos />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}