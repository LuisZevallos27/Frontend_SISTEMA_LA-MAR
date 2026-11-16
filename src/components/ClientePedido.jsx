import { useState } from 'react'
import SelectorCliente from './SelectorCliente'

export default function ClientePedido({ pedido, onAsignar }) {
    const [editando, setEditando] = useState(false)
    const tieneCliente = Boolean(pedido.clienteDni)

    if (tieneCliente && !editando) {
        return (
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="font-semibold">{pedido.cliente}</p>
                    <p className="text-sm text-neutral-600">
                        {pedido.clienteDni.length === 11 ? 'RUC' : 'DNI'}: {pedido.clienteDni}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setEditando(true)}
                    className="rounded-full border border-marino-900 px-4 py-1.5 text-sm font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white"
                >
                    Cambiar
                </button>
            </div>
        )
    }

    return (
        <SelectorCliente
            ayuda={
                tieneCliente
                    ? 'Documento del nuevo cliente:'
                    : 'Sin cliente asignado (público general). Busca por DNI o RUC:'
            }
            onSeleccionar={async (c) => {
                const ok = await onAsignar(c.dni)
                if (ok) setEditando(false)
                return ok
            }}
            onCancelar={tieneCliente ? () => setEditando(false) : undefined}
        />
    )
}