import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'

export default function MontoAnimado({ valor, className }) {
  const reducido = useReducedMotion()
  const destino = Number(valor ?? 0)
  const mv = useMotionValue(destino)
  const texto = useTransform(mv, (v) => 'S/ ' + v.toFixed(2))

  useEffect(() => {
    const control = animate(mv, destino, { duration: reducido ? 0 : 0.45, ease: 'easeOut' })
    return () => control.stop()
  }, [destino, mv, reducido])

  return <motion.span className={className}>{texto}</motion.span>
}