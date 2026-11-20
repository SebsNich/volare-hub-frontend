// Lógica pura del tema de color. No toca el DOM: así se prueba sin navegador.
export const PREFERENCIAS_TEMA = ['sistema', 'claro', 'oscuro']
export const CLAVE_TEMA = 'volare-tema'

// Cualquier valor raro guardado en el navegador se trata como "sistema".
export function normalizarPreferencia(valor) {
    return PREFERENCIAS_TEMA.includes(valor) ? valor : 'sistema'
}

// Devuelve el tema que realmente se pinta: 'claro' u 'oscuro'.
export function resolverTema(preferencia, sistemaPideOscuro) {
    if (preferencia === 'claro' || preferencia === 'oscuro') return preferencia
    return sistemaPideOscuro ? 'oscuro' : 'claro'
}

export function siguientePreferencia(actual) {
    const posicion = PREFERENCIAS_TEMA.indexOf(normalizarPreferencia(actual))
    return PREFERENCIAS_TEMA[(posicion + 1) % PREFERENCIAS_TEMA.length]
}
