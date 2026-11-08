export function mensajeError(error, porDefecto = 'Ocurrió un error inesperado') {
    if (!error.response) return 'No se pudo conectar con el servidor'
    const msg = error.response.data?.message
    if (typeof msg === 'string' && msg.length > 0 && msg.length < 200) return msg
    return porDefecto
}