import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'
import AvatarUsuario from './AvatarUsuario'
import ModalAuth from './ModalAuth'

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false)

    return (
        <nav className="sticky top-0 z-50 bg-white text-volare-azul shadow-lg">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 min-w-0">
                    <img src="/logo-volare.png" alt="Logo Urbanización Volare" className="h-10 sm:h-12 w-auto shrink-0" />
                    <div className="hidden sm:block w-px h-8 bg-gray-300" />
                    <span className="hidden sm:inline text-xl font-bold tracking-wide text-volare-azul truncate">Volare Hub</span>
                </Link>
                <div className="flex items-center gap-3 sm:gap-5">
                    <Link to="/" className="text-gray-600 hover:text-volare-azul transition" aria-label="Inicio">
                        <HiOutlineHome size={22} />
                    </Link>
                    {usuario && usuario.rol === 'ADMIN' && (
                        <Link to="/admin" className="hover:text-volare-azul transition">Panel Admin</Link>
                    )}
                    {usuario && (
                        <Link to={`/perfil/${usuario.id}`} className="flex items-center gap-2 hover:text-volare-azul transition">
                            <AvatarUsuario foto={usuario.foto} size={36} />
                            <span className="hidden sm:inline font-medium">{usuario.nombre}</span>
                        </Link>
                    )}
                    {!usuario && (
                        <button
                            onClick={() => setModalAuthAbierto(true)}
                            className="text-gray-600 font-medium hover:text-volare-azul transition"
                        >
                            Iniciar sesión
                        </button>
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
            {modalAuthAbierto && <ModalAuth onClose={() => setModalAuthAbierto(false)} />}
        </nav>
    )
}

export default Navbar
