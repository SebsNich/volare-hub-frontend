function obtenerNombreArchivo(url) {
    const partes = url.split('/')
    const nombreConId = partes[partes.length - 1]
    return nombreConId
}

export default obtenerNombreArchivo