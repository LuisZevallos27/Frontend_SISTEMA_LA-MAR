export function soles(valor) {
  return 'S/ ' + Number(valor ?? 0).toFixed(2)
}

// Minúsculas y sin tildes: "Limón" y "limon" se encuentran entre sí
export function normalizar(texto) {
  return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}