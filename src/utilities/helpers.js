function obtenerNombreArchivo(url) {
    const partes = url.split('/')
    const nombreConId = partes[partes.length - 1]
    return nombreConId
}

function formatearMesAnio(fecha) {
    const texto = new Date(fecha).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function normalizarTexto(texto) {
    return texto
        .toString()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLowerCase()
}

function formatearFechaReserva(fecha) {
    return new Date(fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
}

export default obtenerNombreArchivo
export { formatearMesAnio, normalizarTexto, formatearFechaReserva }