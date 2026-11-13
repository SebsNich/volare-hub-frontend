// Copia de la regla del servidor (backend/src/lib/contrasena.js), para avisar
// antes de enviar. El servidor sigue validando: esto solo ahorra un viaje.
// Mínimo en caracteres; máximo en bytes UTF-8, que es lo que cuenta bcrypt.
export const MINIMO_CARACTERES = 8
export const MAXIMO_BYTES = 72

export const bytesUtf8 = (texto) => new TextEncoder().encode(texto).length

export function validarContrasena(password) {
    if (typeof password !== 'string' || password.length < MINIMO_CARACTERES) {
        return `La contraseña debe tener al menos ${MINIMO_CARACTERES} caracteres.`
    }
    if (bytesUtf8(password) > MAXIMO_BYTES) {
        return `La contraseña es demasiado larga: máximo ${MAXIMO_BYTES} caracteres (las letras con tilde o ñ cuentan doble).`
    }
    return null
}
