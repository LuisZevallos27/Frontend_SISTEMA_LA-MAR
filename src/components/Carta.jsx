import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { normalizar, soles } from '../utils/formato'
import Pestanas from './Pestanas'

// Orden de las pestañas, como en el prototipo; las categorías nuevas van al final
const ORDEN = ['Cebiches', 'Tiraditos', 'Causas', 'Anticuchos', 'Postres', 'Bebidas']

function FotoPlato({ plato }) {
  const [fallo, setFallo] = useState(false)
  const base = 'h-20 w-20 shrink-0 rounded-full shadow sm:h-24 sm:w-24'

  if (plato.imagenUrl && !fallo) {
    return (
      <img
        src={plato.imagenUrl}
        alt={plato.nombre}
        onError={() => setFallo(true)}
        className={base + ' object-cover'}
      />
    )
  }
  return (
    <div className={base + ' flex items-center justify-center bg-marino-800 text-3xl font-bold text-white'}>
      {plato.nombre.charAt(0)}
    </div>
  )
}

export default function Carta({ platos, onAgregar, deshabilitado }) {
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('Todos')

  const categorias = useMemo(() => {
    const existentes = [...new Set(platos.map((p) => p.categoria).filter(Boolean))]
    const ordenadas = [
      ...ORDEN.filter((c) => existentes.includes(c)),
      ...existentes.filter((c) => !ORDEN.includes(c)),
    ]
    return ['Todos', ...ordenadas]
  }, [platos])

  const texto = normalizar(buscar.trim())
  const visibles = platos.filter(
    (p) =>
      (categoria === 'Todos' || p.categoria === categoria) && normalizar(p.nombre).includes(texto),
  )

  return (
    <section className="min-w-0">
      <input
        type="search"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="Buscando…"
        aria-label="Buscar plato"
        className="mb-3 w-full rounded-full bg-white px-5 py-3 shadow-tarjeta outline-none focus:ring-2 focus:ring-lavanda"
      />

      <div className="mb-4">
        <Pestanas
          etiqueta="Categorías de la carta"
          opciones={categorias.map((c) => ({ valor: c, etiqueta: c }))}
          valor={categoria}
          onCambiar={setCategoria}
        />
      </div>

      {visibles.length === 0 && <p className="text-neutral-600">No se encontraron platos.</p>}

      <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visibles.map((p) => (
            <motion.article
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-tarjeta ring-1 ring-black/5 transition-shadow hover:shadow-elevada"
            >
              <div className="flex flex-1 flex-col items-center p-3 text-center">
                <FotoPlato plato={p} />
                <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-tight text-marino-900 sm:text-base">
                  {p.nombre}
                </h3>
                {p.descripcion && (
                  <p className="mt-1 hidden text-xs text-neutral-500 sm:block">
                    <span className="line-clamp-2">{p.descripcion}</span>
                  </p>
                )}
                <p className="mt-auto pt-2 text-base font-bold sm:text-lg">{soles(p.precio)}</p>
              </div>
              <button
                type="button"
                disabled={deshabilitado}
                onClick={() => onAgregar(p)}
                aria-label={`Agregar ${p.nombre}`}
                className="w-full bg-marino-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-marino-700 active:bg-marino-700 disabled:opacity-50"
              >
                + Agregar
              </button>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}