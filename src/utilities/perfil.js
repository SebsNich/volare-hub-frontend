// Solo se muestra si hay las dos: media dirección confunde más que ayuda, y un
// admin no tiene casa asignada.
export function textoUbicacion(usuario) {
    if (!usuario?.manzana || !usuario?.villa) return ''
    return etiquetaCasa(usuario.manzana, usuario.villa)
}

// Un solo formato para toda la interfaz ("Mz 07 Vll 03"): si mañana cambia, se
// cambia aquí y no en diez pantallas.
export function etiquetaCasa(manzana, villa) {
    return `Mz ${manzana} Vll ${villa}`
}
