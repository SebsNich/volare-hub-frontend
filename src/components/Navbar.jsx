import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth } from 'react-icons/hi2'
import AvatarUsuario from './AvatarUsuario'
import ModalAuth from './ModalAuth'
import Tooltip from './Tooltip'

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false)

    function manejarLogout() {
        logout()
        mostrarToast('Sesión cerrada', 'exito')
    }

    return (
        <nav className="sticky top-0 z-50 bg-white text-volare-azul shadow-lg">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 min-w-0">
                    <img src="/logo-volare.png" alt="Logo Urbanización Volare" className="h-10 sm:h-12 w-auto shrink-0" />
                    <div className="hidden sm:block w-px h-8 bg-gray-300" />
                    <span className="hidden sm:inline text-xl font-bold tracking-wide text-volare-azul truncate">Volare Hub</span>
                </Link>
                <div className="flex items-center gap-3 sm:gap-5">
                    <Tooltip texto="Inicio" posicion="abajo">
                        <Link to="/" className="text-gray-600 hover:text-volare-azul transition" aria-label="Inicio">
                            <HiOutlineHome size={22} />
                        </Link>
                    </Tooltip>
                    {usuario && usuario.rol === 'ADMIN' && (
                        <Tooltip texto="Panel de administración" posicion="abajo">
                            <Link to="/admin" className="flex items-center gap-1.5 hover:text-volare-azul transition">
                                <HiOutlineCog6Tooth size={20} />
                                <span className="hidden sm:inline">Panel Admin</span>
                            </Link>
                        </Tooltip>
                    )}
                    {usuario && (
                        <Tooltip texto="Mi perfil" posicion="abajo">
                            <Link to={`/perfil/${usuario.id}`} className="flex items-center gap-2 hover:text-volare-azul transition">
                                <AvatarUsuario foto={usuario.foto} size={36} />
                                <span className="hidden sm:inline font-medium">{usuario.nombre}</span>
                            </Link>
                        </Tooltip>
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
                        <Tooltip texto="Cerrar sesión" posicion="abajo">
                            <button
                                onClick={manejarLogout}
                                aria-label="Cerrar sesión"
                                className="w-9 h-9 flex items-center justify-center rounded-full bg-volare-azul text-white hover:opacity-90 transition"
                            >
                                <HiOutlineArrowRightOnRectangle size={20} />
                            </button>
                        </Tooltip>
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
