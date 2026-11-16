export function soles(valor) {
  return 'S/ ' + Number(valor ?? 0).toFixed(2)
}

// Cantidades de insumos: hasta 3 decimales, sin ceros sobrantes (34.62, 188, 0.38)
export function cantidad(valor) {
  return Number(valor ?? 0).toLocaleString('es-PE', { maximumFractionDigits: 3 })
}

// Minúsculas y sin tildes: "Limón" y "limon" se encuentran entre sí
export function normalizar(texto) {
  return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}