import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)

    return (
        <nav className="bg-volare-azul text-white px-6 py-4 flex items-center justify-between shadow-md">
            <Link to="/" className="text-xl font-bold tracking-wide">Volare Hub</Link>
            <div className="flex items-center gap-4">
                <Link to="/" className="hover:text-yellow-300 transition">Inicio</Link>
                {usuario && usuario.rol === 'ADMIN' && (
                    <Link to="/admin" className="hover:text-yellow-300 transition">Panel Admin</Link>
                )}
                {usuario && (
                    <Link to={`/perfil/${usuario.id}`} className="hover:text-yellow-300 transition">
                        {usuario.nombre}
                    </Link>
                )}
                {!usuario && (
                    <Link to="/login" className="hover:text-yellow-300 transition">Iniciar sesión</Link>
                )}
                {usuario && (
                    <button onClick={logout} className="bg-white text-volare-azul px-3 py-1 rounded-full text-sm font-semibold hover:bg-yellow-300 transition">
                        Cerrar sesión
                    </button>
                )}
            </div>
        </nav>
    )
}

export default Navbar