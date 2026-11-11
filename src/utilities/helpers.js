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

const REGEX_CEDULA = /^\d{10}$/

function esCedulaValida(cedula) {
    return REGEX_CEDULA.test(cedula)
}

function nombreCompleto(usuario) {
    if (!usuario) return ''
    return `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim()
}

// Si el backend no envía estadoCuenta (datos de antes del bloque 8) se trata
// como APROBADA: es el mismo criterio con el que se migraron las cuentas viejas.
function estadoDeCuenta(usuario) {
    return usuario?.estadoCuenta ?? 'APROBADA'
}

function esCuentaPendiente(usuario) {
    return Boolean(usuario) && estadoDeCuenta(usuario) === 'PENDIENTE'
}

export default obtenerNombreArchivo
export { formatearMesAnio, normalizarTexto, formatearFechaReserva, esCedulaValida, nombreCompleto, estadoDeCuenta, esCuentaPendiente }