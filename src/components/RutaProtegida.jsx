import { useContext, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { esCuentaPendiente } from '../utilities/helpers'

function RutaProtegida({ children, rolRequerido, soloAprobadas = false }) {
    const { usuario, cargando } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const bloqueadaPorPendiente = soloAprobadas && esCuentaPendiente(usuario)
    // El ref evita que StrictMode (que repite los efectos en desarrollo) muestre el aviso dos veces.
    // Se reinicia al dejar de estar bloqueada porque React reutiliza esta misma
    // instancia al cambiar de ruta (/feed y /reservas usan RutaProtegida en la misma
    // posición); sin el reinicio, el aviso solo saldría la primera vez.
    const avisoMostrado = useRef(false)

    useEffect(() => {
        if (!bloqueadaPorPendiente) {
            avisoMostrado.current = false
            return
        }
        if (avisoMostrado.current) return
        avisoMostrado.current = true
        mostrarToast('Esta sección estará disponible cuando un administrador apruebe tu cuenta.', 'error')
    }, [bloqueadaPorPendiente, mostrarToast])

    if (cargando) return null // o un spinner

    if (!usuario) {
        return <Navigate to="/" />
    }

    if (rolRequerido) {
        const rolesPermitidos = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido]
        if (!rolesPermitidos.includes(usuario.rol)) {
            return <Navigate to="/" />
        }
    }

    if (bloqueadaPorPendiente) {
        return <Navigate to="/feed" replace />
    }

    return children
}

export default RutaProtegida
