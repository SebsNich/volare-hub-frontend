// Reduce una imagen antes de pegarla en el mensaje: una foto de celular pesa
// varios MB y el correo (y el servidor) tienen límites. Se escala a un ancho
// máximo y se guarda como JPG o PNG (PNG solo si ya lo era, por la transparencia).
export const MAX_ANCHO_IMAGEN = 900
export const MAX_BYTES_IMAGEN_ORIGINAL = 8 * 1024 * 1024

export async function imagenADataUrl(archivo) {
    if (!/^image\/(png|jpe?g|webp)$/.test(archivo.type)) throw new Error('Usa una imagen JPG, PNG o WEBP')
    if (archivo.size > MAX_BYTES_IMAGEN_ORIGINAL) throw new Error('La imagen puede pesar hasta 8 MB')
    const bitmap = await createImageBitmap(archivo)
    const escala = Math.min(1, MAX_ANCHO_IMAGEN / bitmap.width)
    const lienzo = document.createElement('canvas')
    lienzo.width = Math.round(bitmap.width * escala)
    lienzo.height = Math.round(bitmap.height * escala)
    const contexto = lienzo.getContext('2d')
    if (archivo.type !== 'image/png') { contexto.fillStyle = '#ffffff'; contexto.fillRect(0, 0, lienzo.width, lienzo.height) }
    contexto.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height)
    bitmap.close?.()
    return archivo.type === 'image/png' ? lienzo.toDataURL('image/png') : lienzo.toDataURL('image/jpeg', 0.85)
}
