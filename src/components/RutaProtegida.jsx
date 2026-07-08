import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

function RutaProtegida({ children, rolRequerido }) {
    const { usuario, cargando } = useContext(AuthContext)

    if (cargando) return null // o un spinner

    if (!usuario) {
        return <Navigate to="/" />
    }

    if (rolRequerido && usuario.rol !== rolRequerido) {
        return <Navigate to="/" />
    }

    return children
}

export default RutaProtegida