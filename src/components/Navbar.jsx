import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
    const { usuario } = useContext(AuthContext)

    return (
        <nav>
            {usuario ? <p>Hola, {usuario.nombre}</p> : <p>No has iniciado sesión</p>}
            <Link to="/">Inicio</Link>
            <Link to="/login">Iniciar sesión</Link>
        </nav>
    )
}

export default Navbar