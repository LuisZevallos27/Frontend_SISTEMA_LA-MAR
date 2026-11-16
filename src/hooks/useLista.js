import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'

// Carga una lista desde la API. datos es null mientras carga la primera vez.
export default function useLista(ruta) {
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState('')
    const [recarga, setRecarga] = useState(0)

    useEffect(() => {
        let cancelado = false
        api
            .get(ruta)
            .then(({ data }) => {
                if (cancelado) return
                setDatos(data)
                setError('')
            })
            .catch((e) => {
                if (!cancelado) setError(mensajeError(e, 'No se pudieron cargar los datos'))
            })
        return () => {
            cancelado = true
        }
    }, [ruta, recarga])

    const recargar = useCallback(() => setRecarga((n) => n + 1), [])
    return { datos, error, recargar }
}