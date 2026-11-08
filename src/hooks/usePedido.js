import { useEffect, useState } from 'react'
import api from '../api/client'
import { mensajeError } from '../api/errores'

export default function usePedido(idMesa) {
  const [mesa, setMesa] = useState(undefined) // undefined: cargando, null: no existe
  const [platos, setPlatos] = useState([])
  const [pedido, setPedido] = useState(undefined) // undefined: cargando, null: sin pedido abierto
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      try {
        const [mesas, carta] = await Promise.all([api.get('/mesas'), api.get('/platos')])
        if (cancelado) return
        setMesa(mesas.data.find((m) => String(m.id) === idMesa) ?? null)
        setPlatos(carta.data)

        try {
          const { data } = await api.get(`/pedidos/mesa/${idMesa}/abierto`)
          if (!cancelado) setPedido(data)
        } catch (e) {
          if (e.response?.status !== 404) throw e
          if (!cancelado) setPedido(null)
        }
      } catch (e) {
        if (!cancelado) setError(mensajeError(e, 'No se pudo cargar la mesa'))
      }
    }

    cargar()
    return () => {
      cancelado = true
    }
  }, [idMesa])

  // Ejecuta una accion contra la API bloqueando los botones; devuelve true si salio bien
  async function ejecutar(accion) {
    setOcupado(true)
    setError('')
    try {
      await accion()
      return true
    } catch (e) {
      setError(mensajeError(e))
      return false
    } finally {
      setOcupado(false)
    }
  }

  const abrir = () =>
    ejecutar(async () => {
      const { data } = await api.post('/pedidos', { idMesa: Number(idMesa) })
      setPedido(data)
    })

  const agregar = (plato) =>
    ejecutar(async () => {
      const { data } = await api.post(`/pedidos/${pedido.id}/items`, { idPlato: plato.id, cantidad: 1 })
      setPedido(data)
    })

  const cambiarCantidad = (item, cantidad) =>
    ejecutar(async () => {
      const { data } = await api.put(`/pedidos/${pedido.id}/items/${item.idPlato}`, { cantidad })
      setPedido(data)
    })

  const quitar = (item) =>
    ejecutar(async () => {
      const { data } = await api.delete(`/pedidos/${pedido.id}/items/${item.idPlato}`)
      setPedido(data)
    })

  const anular = () => ejecutar(() => api.post(`/pedidos/${pedido.id}/anular`, {}))

  return { mesa, platos, pedido, error, ocupado, abrir, agregar, cambiarCantidad, quitar, anular }
}