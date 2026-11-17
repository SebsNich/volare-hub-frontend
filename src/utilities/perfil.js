// Solo se muestra si hay las dos: media dirección confunde más que ayuda, y un
// admin no tiene casa asignada.
export function textoUbicacion(usuario) {
    if (!usuario?.manzana || !usuario?.villa) return ''
    return `Manzana ${usuario.manzana} · Villa ${usuario.villa}`
}
