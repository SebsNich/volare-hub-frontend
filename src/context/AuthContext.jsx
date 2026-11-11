import { createContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'
import { useToast } from './ToastContext'
import { estadoDeCuenta, esCuentaPendiente } from '../utilities/helpers'

const AuthContext = createContext()

// Una cuenta pendiente revisa su estado cada minuto para enterarse de la
// aprobación sin volver a iniciar sesión (el token no cambia: el backend
// consulta el estado en la base en cada petición).
const INTERVALO_REVISION_PENDIENTE_MS = 60000
const DURACION_AVISO_LARGO_MS = 8000

function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)
    const [cargando, setCargando] = useState(true)
    const navigate = useNavigate()
    const { mostrarToast } = useToast()
    const estadoAnterior = useRef(null)

    const cerrarSesionForzada = useCallback((mensaje) => {
        localStorage.removeItem('token')
        setUsuario(null)
        navigate('/')
        mostrarToast(mensaje, 'error', DURACION_AVISO_LARGO_MS)
    }, [navigate, mostrarToast])

    // Vuelve a pedir el perfil. Un 401/403 significa que la cuenta ya no puede
    // usarse (rechazada, desactivada o token vencido) y se cierra la sesión.
    // Un fallo de red o del servidor NO cierra la sesión: no es culpa del usuario.
    const refrescarUsuario = useCallback(async () => {
        const token = localStorage.getItem('token')
        if (!token) return null

        let respuesta
        try {
            respuesta = await fetch(`${API_URL}/api/auth/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        } catch {
            return undefined
        }
        const datos = await respuesta.json().catch(() => ({}))

        if (respuesta.ok) {
            setUsuario(datos.user)
            return datos.user
        }
        if (respuesta.status === 401 || respuesta.status === 403) {
            cerrarSesionForzada(datos.mensaje || 'Tu sesión ya no es válida. Inicia sesión de nuevo.')
            return null
        }
        return undefined
    }, [cerrarSesionForzada])

    useEffect(() => {
        async function verificarSesion() {
            const user = await refrescarUsuario()
            console.log(user) // pendiente del viernes 2026-11-13: quitar
            setCargando(false)
        }
        verificarSesion()
        // Solo al cargar la app; las revisiones siguientes las hacen los efectos de abajo.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Al volver a la pestaña se revisa el estado: así se nota una aprobación,
    // un rechazo o una desactivación ocurridos mientras el usuario no miraba.
    useEffect(() => {
        function alCambiarVisibilidad() {
            if (document.visibilityState === 'visible') refrescarUsuario()
        }
        document.addEventListener('visibilitychange', alCambiarVisibilidad)
        return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad)
    }, [refrescarUsuario])

    const pendiente = esCuentaPendiente(usuario)
    useEffect(() => {
        if (!pendiente) return
        const intervalo = setInterval(refrescarUsuario, INTERVALO_REVISION_PENDIENTE_MS)
        return () => clearInterval(intervalo)
    }, [pendiente, refrescarUsuario])

    useEffect(() => {
        const estado = usuario ? estadoDeCuenta(usuario) : null
        if (estadoAnterior.current === 'PENDIENTE' && estado === 'APROBADA') {
            mostrarToast('¡Tu cuenta fue aprobada! Ya puedes publicar y reservar.', 'exito', DURACION_AVISO_LARGO_MS)
        }
        estadoAnterior.current = estado
    }, [usuario, mostrarToast])

    function logout() {
        localStorage.removeItem('token')
        setUsuario(null)
        navigate('/')
    }

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, logout, cargando, refrescarUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }
