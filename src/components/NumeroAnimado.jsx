import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

// Cuenta hacia el nuevo valor cada vez que cambia
export default function NumeroAnimado({ valor, decimales = 0, prefijo = '', sufijo = '', className }) {
    const reducido = useReducedMotion()
    const destino = Number(valor ?? 0)
    const mv = useMotionValue(destino)
    const texto = useTransform(
        mv,
        (v) =>
            prefijo +
            v.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales }) +
            sufijo,
    )

    useEffect(() => {
        const control = animate(mv, destino, { duration: reducido ? 0 : 0.6, ease: 'easeOut' })
        return () => control.stop()
    }, [destino, mv, reducido])

    return <motion.span className={className}>{texto}</motion.span>
}