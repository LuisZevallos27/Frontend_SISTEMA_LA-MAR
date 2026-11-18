// Todas las fechas se manejan como texto "AAAA-MM-DD" en hora local
export function fechaISO(d) {
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const dia = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mes}-${dia}`
}

// "Hoy" siempre en hora de Lima, aunque el navegador esté en otra zona horaria
export const hoyISO = () =>
    new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())

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

// "2026-11-08T10:30:12.123" -> "08/11/2026 10:30"
export function fechaHoraCorta(iso) {
    if (!iso) return '-'
    const [fecha, hora = ''] = iso.split('T')
    const [a, m, d] = fecha.split('-')
    return `${d}/${m}/${a} ${hora.slice(0, 5)}`.trim()
}