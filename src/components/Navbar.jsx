import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)

    return (
        <nav className="sticky top-0 z-50 bg-white text-volare-azul shadow-lg">
            <div className="px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <img src="/logo-volare.png" alt="Logo Urbanización Volare" className="h-12 w-auto" />
                    <div className="w-px h-8 bg-gray-300" />
                    <span className="text-xl font-bold tracking-wide text-volare-azul">Volare Hub</span>
                </Link>
                <div className="flex items-center gap-5">
                    <Link to="/" className="text-gray-600 hover:text-volare-azul transition" aria-label="Inicio">
                        <HiOutlineHome size={22} />
                    </Link>
                    {usuario && usuario.rol === 'ADMIN' && (
                        <Link to="/admin" className="hover:text-volare-azul transition">Panel Admin</Link>
                    )}
                    {usuario && (
                        <Link to={`/perfil/${usuario.id}`} className="flex items-center gap-2 hover:text-volare-azul transition">
                            {usuario.foto ? (
                                <img src={usuario.foto} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                                <HiOutlineUserCircle size={36} className="text-gray-400" />
                            )}
                            <span className="font-medium">{usuario.nombre}</span>
                        </Link>
                    )}
                    {!usuario && (
                        <Link to="/login" className="hover:text-volare-azul transition">Iniciar sesión</Link>
                    )}
                    {usuario && (
                        <button
                            onClick={logout}
                            title="Cerrar sesión"
                            aria-label="Cerrar sesión"
                            className="w-9 h-9 flex items-center justify-center rounded-full bg-volare-azul text-white hover:opacity-90 transition"
                        >
                            <HiOutlineArrowRightOnRectangle size={20} />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex h-1.5">
                <div className="flex-1 bg-volare-azul" />
                <div className="flex-1 bg-volare-verde" />
                <div className="flex-1 bg-volare-naranja" />
            </div>
        </nav>
    )
}

export default Navbar
