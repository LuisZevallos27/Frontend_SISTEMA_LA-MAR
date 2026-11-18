import { useCallback, useEffect, useRef, useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'

// Consulta el resumen del dashboard y lo refresca cada cierto tiempo.
// Solo reemplaza los datos cuando algo cambió, para que los gráficos no se redibujen en vano.
export default function useDashboard(dias, intervaloMs = 10000) {
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState('')
    const firma = useRef('')
    const ultimaPeticion = useRef(0)

    const cargar = useCallback(async () => {
        const numero = ++ultimaPeticion.current
        try {
            const { data } = await api.get('/dashboard/resumen', { params: { dias } })
            if (numero !== ultimaPeticion.current) return // llegó tarde: ya se pidió otro período
            const { generadoEn, ...resto } = data
            const nueva = JSON.stringify(resto)
            if (nueva !== firma.current) {
                firma.current = nueva
                setDatos(data)
            } else {
                setDatos((previo) => (previo ? { ...previo, generadoEn } : data))
            }
            setError('')
        } catch (e) {
            if (numero === ultimaPeticion.current) setError(mensajeError(e, 'No se pudo actualizar el dashboard'))
        }
    }, [dias])

    useEffect(() => {
        cargar()
        const temporizador = setInterval(cargar, intervaloMs)
        return () => clearInterval(temporizador)
    }, [cargar, intervaloMs])

    return { datos, error, recargar: cargar }
}