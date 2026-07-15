import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Link } from 'react-router-dom'
import { HiOutlineHome, HiOutlineArrowRightOnRectangle, HiOutlineCog6Tooth, HiOutlineWrenchScrewdriver, HiChevronDown, HiBars3, HiXMark } from 'react-icons/hi2'
import AvatarUsuario from './AvatarUsuario'
import ModalAuth from './ModalAuth'
import Tooltip from './Tooltip'
import { API_URL } from '../config/api'
import { nombreCompleto } from '../utilities/helpers'

const INTERVALO_NOTIFICACIONES_MS = 60000

function Navbar() {
    const { usuario, logout } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [modalAuthAbierto, setModalAuthAbierto] = useState(false)
    const [serviciosAbierto, setServiciosAbierto] = useState(false)
    const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
    const [serviciosMovilAbierto, setServiciosMovilAbierto] = useState(false)
    const [notificacionesPendientes, setNotificacionesPendientes] = useState(0)
    const serviciosRef = useRef(null)
    const navRef = useRef(null)

    const mostrarServicios = usuario && (usuario.rol === 'RESIDENTE' || usuario.rol === 'ADMIN')

    function manejarLogout() {
        logout()
        mostrarToast('Sesión cerrada', 'exito')
    }

    function cerrarMenuMovil() {
        setMenuMovilAbierto(false)
        setServiciosMovilAbierto(false)
    }

    useEffect(() => {
        function manejarClickFuera(e) {
            if (serviciosRef.current && !serviciosRef.current.contains(e.target)) {
                setServiciosAbierto(false)
            }
            if (navRef.current && !navRef.current.contains(e.target)) {
                cerrarMenuMovil()
            }
        }
        document.addEventListener('mousedown', manejarClickFuera)
        return () => document.removeEventListener('mousedown', manejarClickFuera)
    }, [])

    useEffect(() => {
        if (!mostrarServicios) return

        async function cargarNotificaciones() {
            try {
                const respuesta = await fetch(`${API_URL}/api/reservas/mias/no-leidas`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (!respuesta.ok) return
                const datos = await respuesta.json()
                setNotificacionesPendientes(datos.cantidad)
            } catch {
                // silencioso: no interrumpir la navegación por un fallo de notificaciones
            }
        }

        cargarNotificaciones()
        const intervalo = setInterval(cargarNotificaciones, INTERVALO_NOTIFICACIONES_MS)
        return () => clearInterval(intervalo)
    }, [mostrarServicios])

    return (
        <nav ref={navRef} className="sticky top-0 z-50 bg-white text-volare-azul shadow-lg">
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 min-w-0">
                    <img src="/logo-volare.png" alt="Logo Urbanización Volare" className="h-10 sm:h-12 w-auto shrink-0" />
                    <div className="hidden sm:block w-px h-8 bg-gray-300" />
                    <span className="hidden sm:inline text-xl font-bold tracking-wide text-volare-azul truncate">Urbanización Volare</span>
                </Link>
                <div className="flex items-center gap-3 sm:gap-5">
                    <div className="hidden md:flex items-center gap-3 sm:gap-5">
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
                        {mostrarServicios && (
                            <div className="relative" ref={serviciosRef}>
                                <button
                                    onClick={() => setServiciosAbierto(!serviciosAbierto)}
                                    className="flex items-center gap-1.5 text-gray-600 hover:text-volare-azul transition"
                                    aria-haspopup="true"
                                    aria-expanded={serviciosAbierto}
                                >
                                    <HiOutlineWrenchScrewdriver size={20} />
                                    <span className="hidden sm:inline">Servicios</span>
                                    {notificacionesPendientes > 0 && (
                                        <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                            {notificacionesPendientes}
                                        </span>
                                    )}
                                    <HiChevronDown size={14} className={`transition-transform ${serviciosAbierto ? 'rotate-180' : ''}`} />
                                </button>
                                {serviciosAbierto && (
                                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                                        <Link
                                            to="/reservas"
                                            onClick={() => setServiciosAbierto(false)}
                                            className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                                        >
                                            Reservas
                                        </Link>
                                        <Link
                                            to="/reservas/mis-reservas"
                                            onClick={() => setServiciosAbierto(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                                        >
                                            Mis Reservas
                                            {notificacionesPendientes > 0 && (
                                                <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                                    {notificacionesPendientes}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {usuario && (
                        <Tooltip texto="Mi perfil" posicion="abajo">
                            <Link to={`/perfil/${usuario.id}`} className="flex items-center gap-2 hover:text-volare-azul transition">
                                <AvatarUsuario foto={usuario.foto} size={36} />
                                <span className="hidden sm:inline font-medium">{nombreCompleto(usuario)}</span>
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
                    <button
                        onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                        className="md:hidden relative text-gray-600 hover:text-volare-azul transition"
                        aria-label={menuMovilAbierto ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuMovilAbierto}
                    >
                        {menuMovilAbierto ? <HiXMark size={24} /> : <HiBars3 size={24} />}
                        {!menuMovilAbierto && notificacionesPendientes > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
                        )}
                    </button>
                </div>
            </div>

            {menuMovilAbierto && (
                <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 animate-volare-barrido-derecha">
                    <Link
                        to="/"
                        onClick={cerrarMenuMovil}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                    >
                        <HiOutlineHome size={20} />
                        Inicio
                    </Link>
                    {usuario && usuario.rol === 'ADMIN' && (
                        <Link
                            to="/admin"
                            onClick={cerrarMenuMovil}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                        >
                            <HiOutlineCog6Tooth size={20} />
                            Panel Admin
                        </Link>
                    )}
                    {mostrarServicios && (
                        <div className="flex flex-col">
                            <button
                                onClick={() => setServiciosMovilAbierto(!serviciosMovilAbierto)}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                                aria-expanded={serviciosMovilAbierto}
                            >
                                <HiOutlineWrenchScrewdriver size={20} />
                                Servicios
                                {notificacionesPendientes > 0 && (
                                    <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                        {notificacionesPendientes}
                                    </span>
                                )}
                                <HiChevronDown size={14} className={`ml-auto transition-transform ${serviciosMovilAbierto ? 'rotate-180' : ''}`} />
                            </button>
                            {serviciosMovilAbierto && (
                                <div className="flex flex-col pl-9">
                                    <Link
                                        to="/reservas"
                                        onClick={cerrarMenuMovil}
                                        className="px-3 py-2.5 text-sm text-gray-600 hover:text-volare-azul transition"
                                    >
                                        Reservas
                                    </Link>
                                    <Link
                                        to="/reservas/mis-reservas"
                                        onClick={cerrarMenuMovil}
                                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:text-volare-azul transition"
                                    >
                                        Mis Reservas
                                        {notificacionesPendientes > 0 && (
                                            <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                                                {notificacionesPendientes}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
