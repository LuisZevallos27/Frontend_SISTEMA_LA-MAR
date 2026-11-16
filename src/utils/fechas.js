// Todas las fechas se manejan como texto "AAAA-MM-DD" en hora local
export function fechaISO(d) {
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mes}-${dia}`
}

export const hoyISO = () => fechaISO(new Date())

export function sumarDias(iso, n) {
    const [a, m, d] = iso.split('-').map(Number)
    return fechaISO(new Date(a, m - 1, d + n))
}

// "2026-11-08" -> "Domingo, 8 de noviembre"
export function fechaLarga(iso) {
    const [a, m, d] = iso.split('-').map(Number)
    const texto = new Date(a, m - 1, d).toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}