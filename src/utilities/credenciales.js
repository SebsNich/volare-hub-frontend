// Ayudas de la pantalla de perfil y seguridad. Todo es lógica pura (sin React)
// para poder probarla con node --test. El servidor vuelve a validar todo.
import { MINIMO_CARACTERES, validarContrasena } from './contrasena.js'

export const MAXIMO_BIO = 200

// Misma regla que el servidor (backend/src/lib/validadores.js): móvil de
// Ecuador, guardado como 09XXXXXXXX. Devuelve null si no es válido.
export function normalizarCelular(celular) {
    if (typeof celular !== 'string') return null
    let digitos = celular.replace(/[\s\-().]/g, '')
    if (digitos.startsWith('+593')) digitos = '0' + digitos.slice(4)
    else if (digitos.startsWith('593') && digitos.length === 12) digitos = '0' + digitos.slice(3)
    return /^09\d{8}$/.test(digitos) ? digitos : null
}

export const MENSAJE_CELULAR = 'Escribe un celular de Ecuador de 10 dígitos que empiece con 09 (ejemplo: 0991234567).'

// La cédula es un dato sensible: en pantalla solo se ven los extremos.
export function enmascararCedula(cedula) {
    if (typeof cedula !== 'string' || cedula.length < 4) return 'No registrada'
    return `${cedula.slice(0, 2)}${'•'.repeat(cedula.length - 4)}${cedula.slice(-2)}`
}

// "sebasnichr17@gmail.com" -> "se•••••••@gmail.com"
export function enmascararEmail(email) {
    if (typeof email !== 'string' || !email.includes('@')) return ''
    const [usuario, dominio] = email.split('@')
    const visibles = usuario.slice(0, 2)
    return `${visibles}${'•'.repeat(Math.max(1, usuario.length - visibles.length))}@${dominio}`
}

// Requisitos que se marcan en vivo. Los dos primeros son obligatorios (los exige
// el servidor); los demás solo suben la fortaleza y se recomiendan.
export function requisitosContrasena(password = '') {
    return [
        { id: 'largo', texto: `Al menos ${MINIMO_CARACTERES} caracteres`, cumple: password.length >= MINIMO_CARACTERES, obligatorio: true },
        { id: 'valida', texto: 'Dentro del máximo permitido', cumple: validarContrasena(password.length >= MINIMO_CARACTERES ? password : 'x'.repeat(MINIMO_CARACTERES)) === null, obligatorio: true },
        { id: 'mayuscula', texto: 'Una mayúscula y una minúscula', cumple: /[a-záéíóúñ]/.test(password) && /[A-ZÁÉÍÓÚÑ]/.test(password), obligatorio: false },
        { id: 'numero', texto: 'Un número', cumple: /\d/.test(password), obligatorio: false },
        { id: 'simbolo', texto: 'Un símbolo (por ejemplo ! ? # $)', cumple: /[^A-Za-z0-9áéíóúñÁÉÍÓÚÑ\s]/.test(password), obligatorio: false }
    ]
}

const ETIQUETAS = ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente']

// Nivel 0..4 para la barra. Si no cumple lo obligatorio nunca pasa de "Débil",
// así la barra no felicita una contraseña que el servidor va a rechazar.
export function fortalezaContrasena(password = '') {
    if (!password) return { nivel: 0, etiqueta: '', vacia: true }
    const reqs = requisitosContrasena(password)
    const obligatoriosOk = reqs.filter(r => r.obligatorio).every(r => r.cumple)
    const extras = reqs.filter(r => !r.obligatorio && r.cumple).length
    let nivel = obligatoriosOk ? 1 + extras : 0
    if (obligatoriosOk && password.length >= 12 && nivel < 4) nivel += 1
    nivel = Math.min(nivel, 4)
    if (!obligatoriosOk) nivel = Math.min(nivel, 1)
    return { nivel, etiqueta: ETIQUETAS[nivel], vacia: false }
}
