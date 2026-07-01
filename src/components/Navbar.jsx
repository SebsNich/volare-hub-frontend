import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)

    return (
        <nav>
            {usuario ? <p>Hola, {usuario.nombre}</p> : <p>No has iniciado sesión</p>}
            <Link to="/">Inicio</Link>
            <Link to="/login">Iniciar sesión</Link>
            {usuario && <Link to={`/perfil/${usuario.id}`}>Mi Perfil</Link>}
            {usuario && <button onClick={logout}>Cerrar sesión</button>}
        </nav>
    )
}

export default Navbar