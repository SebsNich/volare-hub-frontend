import { validarContrasena } from '../utilities/contrasena'

// Debajo del campo de contraseña nueva: la regla en gris mientras está vacío,
// el problema en rojo si no cumple y una confirmación en verde si cumple.
function AvisoContrasena({ password }) {
    if (!password) {
        return <p className="text-xs text-gray-500">Entre 8 y 72 caracteres.</p>
    }
    const error = validarContrasena(password)
    if (error) {
        return <p className="text-xs text-red-600" role="alert">{error}</p>
    }
    return <p className="text-xs text-green-700">Longitud correcta.</p>
}

export default AvisoContrasena
