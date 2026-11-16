import { useEffect, useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'

// propina: { tipo: 'ninguna' | 'pct' | 'monto', valor: number }
export function paramsPropina({ tipo, valor }) {
    if (tipo === 'pct' && valor > 0) return { propinaPct: valor }
    if (tipo === 'monto' && valor > 0) return { propina: valor }
    return {}
}

// "refresco" es un valor cualquiera que, al cambiar, vuelve a pedir la cuenta
export default function usePrecuenta(idPedido, propina, refresco) {
    const [precuenta, setPrecuenta] = useState(null)
    const [error, setError] = useState('')
    const { tipo, valor } = propina

    useEffect(() => {
        if (!idPedido) return
        let cancelado = false
        // Pequeña espera para no consultar en cada tecla al escribir un monto
        const temporizador = setTimeout(async () => {
            try {
                const { data } = await api.get(`/pedidos/${idPedido}/precuenta`, {
                    params: paramsPropina({ tipo, valor }),
                })
                if (!cancelado) {
                    setPrecuenta(data)
                    setError('')
                }
            } catch (e) {
                if (!cancelado) setError(mensajeError(e, 'No se pudo calcular la cuenta'))
            }
        }, 250)
        return () => {
            cancelado = true
            clearTimeout(temporizador)
        }
    }, [idPedido, tipo, valor, refresco])

    return { precuenta, error }
}