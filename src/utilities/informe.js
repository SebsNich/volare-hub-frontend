// Ayudas del formulario del informe económico. Las mismas reglas las vuelve a
// aplicar el servidor; aquí solo sirven para avisar antes de enviar.

export const MAX_ADJUNTOS = 5
export const MAX_BYTES_ARCHIVO = 10 * 1024 * 1024
export const MAX_BYTES_TOTAL = 20 * 1024 * 1024
export const TIPOS_ADJUNTO = '.pdf,.xls,.xlsx,.doc,.docx,.csv,.jpg,.jpeg,.png'

const EMAIL_VALIDO = /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/

// Los correos se separan con ";" como piden los programas de correo (también vale "," o salto de línea).
export function leerCorreos(texto) {
    const validos = []
    const invalidos = []
    const vistos = new Set()
    String(texto ?? '').split(/[;,\n\r]+/).map(t => t.trim()).filter(Boolean).forEach(candidato => {
        const correo = candidato.toLowerCase()
        if (!EMAIL_VALIDO.test(correo)) invalidos.push(candidato)
        else if (!vistos.has(correo)) { vistos.add(correo); validos.push(correo) }
    })
    return { validos, invalidos }
}

// Devuelve el mensaje del primer problema, o null si los archivos están bien.
export function problemaConAdjuntos(archivos) {
    if (archivos.length > MAX_ADJUNTOS) return `Puedes adjuntar hasta ${MAX_ADJUNTOS} archivos`
    if (archivos.some(a => a.size > MAX_BYTES_ARCHIVO)) return 'Cada archivo puede pesar hasta 10 MB'
    if (archivos.reduce((suma, a) => suma + a.size, 0) > MAX_BYTES_TOTAL) return 'Los adjuntos no pueden pasar de 20 MB en total'
    return null
}

// Texto que se le muestra al administrador cuando el servidor termina.
export function resumenResultado(resultado) {
    const partes = []
    if (resultado.correo) {
        const { enviados, correosFallidos } = resultado.correo
        partes.push(`Correo enviado a ${enviados} ${enviados === 1 ? 'destinatario' : 'destinatarios'}.`)
        if (correosFallidos.length > 0) partes.push(`No se pudo enviar a ${correosFallidos.length}: reenvíalos desde «Correos específicos».`)
    }
    if (resultado.publicacion) partes.push('Comunicado publicado para los residentes con cuenta aprobada.')
    if (resultado.errorPublicacion) partes.push(resultado.errorPublicacion)
    return partes.join(' ')
}
