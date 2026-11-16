import { Link, useParams, useSearchParams } from 'react-router'
import Ticket from '../components/Ticket'
import usePrecuenta from '../hooks/usePrecuenta'

export default function Comprobante() {
    const { idPedido } = useParams()
    const [params] = useSearchParams()

    const pct = parseFloat(params.get('propinaPct'))
    const monto = parseFloat(params.get('propina'))
    const propina =
        pct > 0 ? { tipo: 'pct', valor: pct } : monto > 0 ? { tipo: 'monto', valor: monto } : { tipo: 'ninguna', valor: 0 }

    const { precuenta, error } = usePrecuenta(idPedido, propina, 0)

    return (
        <div>
            <div className="mb-4 print:hidden">
                <h1 className="text-3xl font-bold text-marino-900">Cuenta cerrada</h1>
                <p className="text-neutral-600">La mesa ya está disponible. Puedes imprimir el comprobante.</p>
            </div>

            {error && (
                <p role="alert" className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 print:hidden">
                    {error}
                </p>
            )}
            {!precuenta && !error && <p className="text-neutral-600">Cargando comprobante…</p>}
            {precuenta && <Ticket cuenta={precuenta} />}

            <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row print:hidden">
                <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={!precuenta}
                    className="flex-1 rounded-full bg-lavanda px-5 py-3 font-semibold text-marino-900 shadow-elevada transition-all hover:brightness-110 disabled:opacity-50"
                >
                    Imprimir
                </button>
                <Link
                    to="/mesas"
                    className="flex-1 rounded-full border border-marino-900 px-5 py-3 text-center font-semibold text-marino-900 transition-colors hover:bg-marino-900 hover:text-white"
                >
                    Volver a mesas
                </Link>
            </div>
        </div>
    )
}