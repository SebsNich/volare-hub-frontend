import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import ArchivoAdjunto from '../components/ArchivoAdjunto'
import {
    HiOutlineUsers,
    HiOutlineInbox,
    HiBars3,
    HiXMark,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlineUserGroup,
    HiOutlineBuildingOffice2,
    HiOutlineEnvelope,
    HiOutlineCalendarDays,
    HiOutlineExclamationTriangle
} from 'react-icons/hi2'
import { normalizarTexto, formatearFechaReserva } from '../utilities/helpers'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA } from '../utilities/constantes'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const SECCIONES = [
    { id: 'resumen', label: 'Resumen', icono: HiOutlineChartBar },
    { id: 'usuarios', label: 'Usuarios', icono: HiOutlineUsers },
    { id: 'sugerencias', label: 'Buzón de Sugerencias', icono: HiOutlineInbox },
    { id: 'reservas', label: 'Gestión de Reservas', icono: HiOutlineCalendarDays },
]

const TARJETAS_RESUMEN = [
    { id: 'publicacionesTotales', label: 'Publicaciones totales', icono: HiOutlineDocumentText, color: 'text-volare-azul' },
    { id: 'residentesActivos', label: 'Residentes activos', icono: HiOutlineUserGroup, color: 'text-volare-verde' },
    { id: 'obrasActivas', label: 'Obras activas', icono: HiOutlineBuildingOffice2, color: 'text-volare-naranja' },
    { id: 'mensajesSinLeer', label: 'Mensajes sin leer', icono: HiOutlineEnvelope, color: 'text-volare-morado' },
    { id: 'reservasPendientes', label: 'Reservas pendientes', icono: HiOutlineCalendarDays, color: 'text-volare-naranja' },
]

const TIPOS_SUGERENCIA = [
    { value: 'SUGERENCIA', label: 'Sugerencia' },
    { value: 'QUEJA', label: 'Queja' },
    { value: 'CONSULTA', label: 'Consulta' },
    { value: 'OTRO', label: 'Otro' },
]

const ESTILOS_ESTADO_SUGERENCIA = {
    SIN_LEER: { color: 'text-volare-naranja', punto: 'bg-volare-naranja', label: 'No leído' },
    LEIDA: { color: 'text-volare-verde', punto: 'bg-volare-verde', label: 'Leído' },
    ARCHIVADA: { color: 'text-gray-400', punto: 'bg-gray-400', label: 'Archivada' },
}

const TAMANO_PAGINA = 10

function ControlesPaginacion({ paginaActual, totalPaginas, onAnterior, onSiguiente }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
                type="button"
                onClick={onAnterior}
                disabled={paginaActual === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${paginaActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-volare-azul text-white hover:opacity-90'}`}
            >
                Anterior
            </button>
            <span className="text-sm text-gray-500">Página {paginaActual} de {totalPaginas}</span>
            <button
                type="button"
                onClick={onSiguiente}
                disabled={paginaActual === totalPaginas}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${paginaActual === totalPaginas ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-volare-azul text-white hover:opacity-90'}`}
            >
                Siguiente
            </button>
        </div>
    )
}

function Admin() {
    const { mostrarToast } = useToast()
    const [usuarios, setUsuarios] = useState([])
    const [nombreAdmin, setNombreAdmin] = useState('')
    const [emailAdmin, setEmailAdmin] = useState('')
    const [passwordAdmin, setPasswordAdmin] = useState('')
    const [modalCrearAdminAbierto, setModalCrearAdminAbierto] = useState(false)
    const [sugerencias, setSugerencias] = useState([])
    const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(null)
    const [seccionActiva, setSeccionActiva] = useState('resumen')
    const [menuAbierto, setMenuAbierto] = useState(false)
    const [resumen, setResumen] = useState(null)

    const [busquedaUsuarios, setBusquedaUsuarios] = useState('')
    const [filtroManzanaVilla, setFiltroManzanaVilla] = useState('')
    const [filtroEstadoUsuario, setFiltroEstadoUsuario] = useState('TODOS')
    const [paginaUsuarios, setPaginaUsuarios] = useState(1)

    const [busquedaSugerencias, setBusquedaSugerencias] = useState('')
    const [filtroTipoSugerencia, setFiltroTipoSugerencia] = useState('TODOS')
    const [mostrarArchivadas, setMostrarArchivadas] = useState(false)
    const [paginaSugerencias, setPaginaSugerencias] = useState(1)

    const [reservas, setReservas] = useState([])
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
    const [mostrandoRechazo, setMostrandoRechazo] = useState(false)
    const [motivoRechazoTexto, setMotivoRechazoTexto] = useState('')
    const [busquedaReservas, setBusquedaReservas] = useState('')
    const [filtroEspacioReserva, setFiltroEspacioReserva] = useState('TODOS')
    const [filtroEstadoReserva, setFiltroEstadoReserva] = useState('TODOS')
    const [paginaReservas, setPaginaReservas] = useState(1)

    async function cargarResumen() {
        const respuesta = await fetch(`${API_URL}/api/admin/resumen`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setResumen(datos)
    }

    async function cargarSugerencias() {
        const respuesta = await fetch(`${API_URL}/api/buzon`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setSugerencias(datos)
    }

    async function marcarLeida(id) {
        const respuesta = await fetch(`${API_URL}/api/buzon/${id}/leida`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (respuesta.ok) {
            mostrarToast('Sugerencia marcada como leída', 'exito')
            cargarSugerencias()
            setSugerenciaSeleccionada(null)
        } else {
            mostrarToast('No se pudo marcar la sugerencia como leída', 'error')
        }
    }

    async function archivarSugerencia(id) {
        const respuesta = await fetch(`${API_URL}/api/buzon/${id}/archivar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (respuesta.ok) {
            mostrarToast('Sugerencia archivada', 'exito')
            cargarSugerencias()
            setSugerenciaSeleccionada(null)
        } else {
            mostrarToast('No se pudo archivar la sugerencia', 'error')
        }
    }

    async function cargarUsuarios() {
        const respuesta = await fetch(`${API_URL}/api/usuarios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setUsuarios(datos.usuarios)
    }

    async function cargarReservas() {
        const respuesta = await fetch(`${API_URL}/api/reservas`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setReservas(datos)
    }

    function abrirModalReserva(reserva) {
        setReservaSeleccionada(reserva)
        setMostrandoRechazo(false)
        setMotivoRechazoTexto('')
    }

    function cerrarModalReserva() {
        setReservaSeleccionada(null)
        setMostrandoRechazo(false)
        setMotivoRechazoTexto('')
    }

    async function aprobarReservaAccion(id) {
        const respuesta = await fetch(`${API_URL}/api/reservas/${id}/aprobar`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (respuesta.ok) {
            mostrarToast('Reserva aprobada', 'exito')
            cargarReservas()
            cargarResumen()
            cerrarModalReserva()
        } else {
            mostrarToast('No se pudo aprobar la reserva', 'error')
        }
    }

    async function rechazarReservaAccion(id, motivo) {
        const respuesta = await fetch(`${API_URL}/api/reservas/${id}/rechazar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ motivoRechazo: motivo })
        })
        if (respuesta.ok) {
            mostrarToast('Reserva rechazada', 'exito')
            cargarReservas()
            cargarResumen()
            cerrarModalReserva()
        } else {
            mostrarToast('No se pudo rechazar la reserva', 'error')
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarResumen()
        cargarUsuarios()
        cargarSugerencias()
        cargarReservas()
    }, [])

    async function cambiarEstado(usuarioId, activoActual) {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${usuarioId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ activo: !activoActual })
        })

        if (respuesta.ok) {
            mostrarToast(activoActual ? 'Usuario desactivado' : 'Usuario activado', 'exito')
            cargarUsuarios()
        } else {
            mostrarToast('No se pudo cambiar el estado del usuario', 'error')
        }
    }

    async function crearAdmin(e) {
        e.preventDefault()

        const respuesta = await fetch(`${API_URL}/api/usuarios/crear-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                nombre: nombreAdmin,
                email: emailAdmin,
                password: passwordAdmin
            })
        })

        if (respuesta.ok) {
            setNombreAdmin('')
            setEmailAdmin('')
            setPasswordAdmin('')
            setModalCrearAdminAbierto(false)
            mostrarToast('Administrador creado', 'exito')
            cargarUsuarios()
        } else {
            const datos = await respuesta.json()
            mostrarToast(datos.mensaje || 'No se pudo crear el administrador', 'error')
        }
    }

    function seleccionarSeccion(id) {
        setSeccionActiva(id)
        setMenuAbierto(false)
    }

    const usuariosFiltrados = usuarios.filter(usuario => {
        const coincideNombre = normalizarTexto(usuario.nombre).includes(normalizarTexto(busquedaUsuarios))
        const textoManzanaVilla = normalizarTexto(`${usuario.manzana || ''} ${usuario.villa || ''}`)
        const coincideManzanaVilla = textoManzanaVilla.includes(normalizarTexto(filtroManzanaVilla))
        const coincideEstado = filtroEstadoUsuario === 'TODOS'
            || (filtroEstadoUsuario === 'ACTIVO' && usuario.activo)
            || (filtroEstadoUsuario === 'INACTIVO' && !usuario.activo)
        return coincideNombre && coincideManzanaVilla && coincideEstado
    })
    const totalPaginasUsuarios = Math.max(1, Math.ceil(usuariosFiltrados.length / TAMANO_PAGINA))
    const paginaUsuariosEfectiva = Math.min(paginaUsuarios, totalPaginasUsuarios)
    const usuariosPagina = usuariosFiltrados.slice((paginaUsuariosEfectiva - 1) * TAMANO_PAGINA, paginaUsuariosEfectiva * TAMANO_PAGINA)

    const sugerenciasFiltradas = sugerencias.filter(sugerencia => {
        const coincideNombre = busquedaSugerencias === ''
            || (sugerencia.nombre && normalizarTexto(sugerencia.nombre).includes(normalizarTexto(busquedaSugerencias)))
        const coincideTipo = filtroTipoSugerencia === 'TODOS' || sugerencia.tipo === filtroTipoSugerencia
        const coincideArchivado = mostrarArchivadas || sugerencia.estado !== 'ARCHIVADA'
        return coincideNombre && coincideTipo && coincideArchivado
    })
    const totalPaginasSugerencias = Math.max(1, Math.ceil(sugerenciasFiltradas.length / TAMANO_PAGINA))
    const paginaSugerenciasEfectiva = Math.min(paginaSugerencias, totalPaginasSugerencias)
    const sugerenciasPagina = sugerenciasFiltradas.slice((paginaSugerenciasEfectiva - 1) * TAMANO_PAGINA, paginaSugerenciasEfectiva * TAMANO_PAGINA)

    const reservasFiltradas = reservas.filter(reserva => {
        const coincideNombre = busquedaReservas === ''
            || normalizarTexto(reserva.usuario?.nombre || '').includes(normalizarTexto(busquedaReservas))
        const coincideEspacio = filtroEspacioReserva === 'TODOS' || reserva.espacio === filtroEspacioReserva
        const coincideEstado = filtroEstadoReserva === 'TODOS' || reserva.estado === filtroEstadoReserva
        return coincideNombre && coincideEspacio && coincideEstado
    })
    const totalPaginasReservas = Math.max(1, Math.ceil(reservasFiltradas.length / TAMANO_PAGINA))
    const paginaReservasEfectiva = Math.min(paginaReservas, totalPaginasReservas)
    const reservasPagina = reservasFiltradas.slice((paginaReservasEfectiva - 1) * TAMANO_PAGINA, paginaReservasEfectiva * TAMANO_PAGINA)

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-volare-azul">Panel de Administración</h1>
                <div className="flex items-center gap-3">
                    {seccionActiva === 'usuarios' && (
                        <button
                            onClick={() => setModalCrearAdminAbierto(true)}
                            className="hidden sm:inline-flex bg-volare-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                        >
                            Crear Admin
                        </button>
                    )}
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="md:hidden text-volare-azul"
                        aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
                    >
                        {menuAbierto ? <HiXMark size={26} /> : <HiBars3 size={26} />}
                    </button>
                </div>
            </div>

            {seccionActiva === 'usuarios' && (
                <button
                    onClick={() => setModalCrearAdminAbierto(true)}
                    className="sm:hidden bg-volare-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition self-start"
                >
                    Crear Admin
                </button>
            )}

            {modalCrearAdminAbierto && (
                <Modal onClose={() => setModalCrearAdminAbierto(false)}>
                    <h3 className="text-lg font-bold text-volare-azul">Crear Admin</h3>
                    <form onSubmit={crearAdmin} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={nombreAdmin}
                            onChange={(e) => setNombreAdmin(e.target.value)}
                            placeholder="Nombre"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <input
                            type="email"
                            value={emailAdmin}
                            onChange={(e) => setEmailAdmin(e.target.value)}
                            placeholder="Email"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <input
                            type="password"
                            value={passwordAdmin}
                            onChange={(e) => setPasswordAdmin(e.target.value)}
                            placeholder="Contraseña"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <button
                            type="submit"
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Crear Admin
                        </button>
                    </form>
                </Modal>
            )}

            <div className="flex flex-col md:flex-row gap-6 items-start">
                <aside className={`${menuAbierto ? 'flex' : 'hidden'} md:flex flex-col gap-1 w-full md:w-56 shrink-0 bg-white rounded-2xl shadow-md border border-gray-100 p-3`}>
                    {SECCIONES.map(seccion => {
                        const Icono = seccion.icono
                        return (
                            <button
                                key={seccion.id}
                                onClick={() => seleccionarSeccion(seccion.id)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition text-left ${seccionActiva === seccion.id ? 'bg-volare-azul text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Icono size={20} />
                                {seccion.label}
                            </button>
                        )
                    })}
                </aside>

                <div className="flex-1 w-full min-w-0">
                    {seccionActiva === 'resumen' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {TARJETAS_RESUMEN.map(tarjeta => {
                                const Icono = tarjeta.icono
                                return (
                                    <div
                                        key={tarjeta.id}
                                        className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-3"
                                    >
                                        <Icono size={28} className={tarjeta.color} />
                                        <span className="text-3xl font-bold text-volare-azul">
                                            {resumen ? resumen[tarjeta.id] : '—'}
                                        </span>
                                        <span className="text-sm text-gray-500">{tarjeta.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {seccionActiva === 'usuarios' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={busquedaUsuarios}
                                    onChange={(e) => { setBusquedaUsuarios(e.target.value); setPaginaUsuarios(1) }}
                                    placeholder="Buscar por nombre..."
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul flex-1"
                                />
                                <input
                                    type="text"
                                    value={filtroManzanaVilla}
                                    onChange={(e) => { setFiltroManzanaVilla(e.target.value); setPaginaUsuarios(1) }}
                                    placeholder="Manzana o Villa"
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-48"
                                />
                                <select
                                    value={filtroEstadoUsuario}
                                    onChange={(e) => { setFiltroEstadoUsuario(e.target.value); setPaginaUsuarios(1) }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-44"
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="ACTIVO">Activo</option>
                                    <option value="INACTIVO">Desactivado</option>
                                </select>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                            <th className="px-4 py-3 whitespace-nowrap">Nombre</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Correo</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Rol</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Manzana/Villa</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuariosPagina.map(usuario => (
                                            <tr key={usuario.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-volare-azul whitespace-nowrap">{usuario.nombre}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{usuario.email}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{usuario.rol}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Mz. {usuario.manzana} Villa {usuario.villa}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${usuario.activo ? 'bg-volare-verde' : 'bg-gray-400'}`}>
                                                        {usuario.activo ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <button
                                                        onClick={() => cambiarEstado(usuario.id, usuario.activo)}
                                                        className="bg-volare-naranja text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition"
                                                    >
                                                        {usuario.activo ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {usuariosPagina.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron usuarios con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaUsuariosEfectiva}
                                    totalPaginas={totalPaginasUsuarios}
                                    onAnterior={() => setPaginaUsuarios(paginaUsuariosEfectiva - 1)}
                                    onSiguiente={() => setPaginaUsuarios(paginaUsuariosEfectiva + 1)}
                                />
                            </div>
                        </div>
                    )}

                    {seccionActiva === 'sugerencias' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={busquedaSugerencias}
                                    onChange={(e) => { setBusquedaSugerencias(e.target.value); setPaginaSugerencias(1) }}
                                    placeholder="Buscar por nombre del remitente..."
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul flex-1"
                                />
                                <select
                                    value={filtroTipoSugerencia}
                                    onChange={(e) => { setFiltroTipoSugerencia(e.target.value); setPaginaSugerencias(1) }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-48"
                                >
                                    <option value="TODOS">Todos los tipos</option>
                                    {TIPOS_SUGERENCIA.map(({ value, label }) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap px-1">
                                    <input
                                        type="checkbox"
                                        checked={mostrarArchivadas}
                                        onChange={(e) => { setMostrarArchivadas(e.target.checked); setPaginaSugerencias(1) }}
                                        className="rounded border-gray-300 text-volare-azul focus:ring-volare-azul"
                                    />
                                    Ver archivadas
                                </label>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                            <th className="px-4 py-3 whitespace-nowrap">Usuario</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Tipo</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sugerenciasPagina.map(sugerencia => (
                                            <tr
                                                key={sugerencia.id}
                                                onClick={() => setSugerenciaSeleccionada(sugerencia)}
                                                className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-medium text-volare-azul">{sugerencia.nombre || 'Anónimo'}</div>
                                                    {(sugerencia.manzana || sugerencia.villa) && (
                                                        <div className="text-xs text-gray-400">
                                                            {[sugerencia.manzana && `Mz. ${sugerencia.manzana}`, sugerencia.villa && `Villa ${sugerencia.villa}`].filter(Boolean).join(' ')}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{sugerencia.tipo}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(sugerencia.creadoEn).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ESTILOS_ESTADO_SUGERENCIA[sugerencia.estado].color}`}>
                                                        <span className={`w-2 h-2 rounded-full ${ESTILOS_ESTADO_SUGERENCIA[sugerencia.estado].punto}`} />
                                                        {ESTILOS_ESTADO_SUGERENCIA[sugerencia.estado].label}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {sugerenciasPagina.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron sugerencias con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaSugerenciasEfectiva}
                                    totalPaginas={totalPaginasSugerencias}
                                    onAnterior={() => setPaginaSugerencias(paginaSugerenciasEfectiva - 1)}
                                    onSiguiente={() => setPaginaSugerencias(paginaSugerenciasEfectiva + 1)}
                                />
                            </div>
                        </div>
                    )}

                    {seccionActiva === 'reservas' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input
                                    type="text"
                                    value={busquedaReservas}
                                    onChange={(e) => { setBusquedaReservas(e.target.value); setPaginaReservas(1) }}
                                    placeholder="Buscar por nombre del residente..."
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul flex-1"
                                />
                                <select
                                    value={filtroEspacioReserva}
                                    onChange={(e) => { setFiltroEspacioReserva(e.target.value); setPaginaReservas(1) }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-48"
                                >
                                    <option value="TODOS">Todos los espacios</option>
                                    {Object.entries(NOMBRES_ESPACIO_RESERVA).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                                <select
                                    value={filtroEstadoReserva}
                                    onChange={(e) => { setFiltroEstadoReserva(e.target.value); setPaginaReservas(1) }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-44"
                                >
                                    <option value="TODOS">Todos los estados</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="APROBADA">Aprobada</option>
                                    <option value="RECHAZADA">Rechazada</option>
                                </select>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                            <th className="px-4 py-3 whitespace-nowrap">Residente</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Espacio</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Horario</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Monto total</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservasPagina.map(reserva => {
                                            const estilo = ESTILOS_ESTADO_RESERVA[reserva.estado]
                                            return (
                                                <tr
                                                    key={reserva.id}
                                                    onClick={() => abrirModalReserva(reserva)}
                                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-volare-azul whitespace-nowrap">{reserva.usuario?.nombre}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{NOMBRES_ESPACIO_RESERVA[reserva.espacio]}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatearFechaReserva(reserva.fecha)}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{NOMBRES_HORARIO_RESERVA[reserva.horario]}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">${Number(reserva.montoAlquiler) + Number(reserva.montoGarantia)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${estilo.color}`}>
                                                                <span className={`w-2 h-2 rounded-full ${estilo.punto}`} />
                                                                {estilo.label}
                                                            </span>
                                                            {reserva.esParaTercero && (
                                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
                                                                    Tercero
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {reservasPagina.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron reservas con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaReservasEfectiva}
                                    totalPaginas={totalPaginasReservas}
                                    onAnterior={() => setPaginaReservas(paginaReservasEfectiva - 1)}
                                    onSiguiente={() => setPaginaReservas(paginaReservasEfectiva + 1)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {sugerenciaSeleccionada && (
                <Modal onClose={() => setSugerenciaSeleccionada(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">{sugerenciaSeleccionada.nombre || 'Anónimo'}</h3>
                    {(sugerenciaSeleccionada.manzana || sugerenciaSeleccionada.villa) && (
                        <p className="text-sm text-gray-400 -mt-3">
                            {[sugerenciaSeleccionada.manzana && `Mz. ${sugerenciaSeleccionada.manzana}`, sugerenciaSeleccionada.villa && `Villa ${sugerenciaSeleccionada.villa}`].filter(Boolean).join(' ')}
                        </p>
                    )}
                    <span className="self-start px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-volare-azul">
                        {sugerenciaSeleccionada.tipo}
                    </span>
                    <p className="text-gray-600">{sugerenciaSeleccionada.mensaje}</p>
                    <p className={`text-xs font-semibold ${ESTILOS_ESTADO_SUGERENCIA[sugerenciaSeleccionada.estado].color}`}>
                        {ESTILOS_ESTADO_SUGERENCIA[sugerenciaSeleccionada.estado].label}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(sugerenciaSeleccionada.creadoEn).toLocaleDateString()}</p>
                    <div className="flex gap-3 self-start">
                        {sugerenciaSeleccionada.estado === 'SIN_LEER' && (
                            <button
                                onClick={() => marcarLeida(sugerenciaSeleccionada.id)}
                                className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Marcar como leída
                            </button>
                        )}
                        {sugerenciaSeleccionada.estado !== 'ARCHIVADA' && (
                            <button
                                onClick={() => archivarSugerencia(sugerenciaSeleccionada.id)}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Archivar
                            </button>
                        )}
                    </div>
                </Modal>
            )}

            {reservaSeleccionada && (
                <Modal onClose={cerrarModalReserva}>
                    <h3 className="text-lg font-bold text-volare-azul">{NOMBRES_ESPACIO_RESERVA[reservaSeleccionada.espacio]}</h3>
                    <p className="text-sm text-gray-500 -mt-3">
                        {formatearFechaReserva(reservaSeleccionada.fecha)} — {NOMBRES_HORARIO_RESERVA[reservaSeleccionada.horario]}
                    </p>

                    <span className={`self-start inline-flex items-center gap-1.5 text-xs font-semibold ${ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].color}`}>
                        <span className={`w-2 h-2 rounded-full ${ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].punto}`} />
                        {ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].label}
                    </span>

                    {reservaSeleccionada.esParaTercero && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex flex-col gap-3">
                            <p className="text-sm font-semibold text-yellow-800 flex items-start gap-2">
                                <HiOutlineExclamationTriangle size={20} className="shrink-0 mt-0.5" />
                                Evento declarado para un tercero (beneficiario particular) — verifica que la lista de invitados y el comprobante correspondan a la tarifa de tercero antes de aprobar.
                            </p>
                            <div className="text-sm text-yellow-900 flex flex-col gap-0.5">
                                <p><span className="font-semibold">Nombre:</span> {reservaSeleccionada.terceroNombre}</p>
                                <p><span className="font-semibold">Cédula:</span> {reservaSeleccionada.terceroCedula}</p>
                                <p><span className="font-semibold">Correo:</span> {reservaSeleccionada.terceroCorreo}</p>
                                <p><span className="font-semibold">Celular:</span> {reservaSeleccionada.terceroCelular}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p><span className="font-semibold text-gray-700">Residente (cuenta):</span> {reservaSeleccionada.usuario?.nombre}</p>
                        <p><span className="font-semibold text-gray-700">Nombres:</span> {reservaSeleccionada.nombres} {reservaSeleccionada.apellidos}</p>
                        <p><span className="font-semibold text-gray-700">Correo:</span> {reservaSeleccionada.correo}</p>
                        <p><span className="font-semibold text-gray-700">Celular:</span> {reservaSeleccionada.celular}</p>
                        <p><span className="font-semibold text-gray-700">Cédula:</span> {reservaSeleccionada.cedula}</p>
                        <p><span className="font-semibold text-gray-700">Motivo del evento:</span> {reservaSeleccionada.motivoEvento}</p>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p className="font-semibold text-gray-700">Datos bancarios (devolución de garantía)</p>
                        <p><span className="font-semibold text-gray-700">Banco:</span> {reservaSeleccionada.bancoNombre}</p>
                        <p><span className="font-semibold text-gray-700">Número de cuenta:</span> {reservaSeleccionada.numeroCuenta}</p>
                        <p><span className="font-semibold text-gray-700">Tipo de cuenta:</span> {reservaSeleccionada.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente'}</p>
                        <p><span className="font-semibold text-gray-700">Cédula/RUC:</span> {reservaSeleccionada.cedulaRucBancario}</p>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-gray-700 text-sm">Documentos</p>
                        <ArchivoAdjunto nombre="Comprobante de pago" href={reservaSeleccionada.comprobantePagoUrl} />
                        <ArchivoAdjunto nombre="Lista de invitados" href={reservaSeleccionada.listaInvitadosUrl} />
                        <ArchivoAdjunto nombre="Contrato firmado" href={reservaSeleccionada.contratoFirmadoUrl} />
                    </div>

                    <hr className="border-gray-200" />

                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex flex-col gap-1">
                        <p>Alquiler: ${Number(reservaSeleccionada.montoAlquiler)}</p>
                        <p>Garantía: ${Number(reservaSeleccionada.montoGarantia)}</p>
                        <p className="font-bold text-volare-azul">
                            Total: ${Number(reservaSeleccionada.montoAlquiler) + Number(reservaSeleccionada.montoGarantia)}
                        </p>
                    </div>

                    {reservaSeleccionada.estado === 'RECHAZADA' && reservaSeleccionada.motivoRechazo && (
                        <p className="text-xs text-gray-500">Motivo de rechazo: {reservaSeleccionada.motivoRechazo}</p>
                    )}

                    {reservaSeleccionada.estado === 'PENDIENTE' && !mostrandoRechazo && (
                        <div className="flex gap-3 self-start">
                            <button
                                onClick={() => aprobarReservaAccion(reservaSeleccionada.id)}
                                className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Aprobar
                            </button>
                            <button
                                onClick={() => setMostrandoRechazo(true)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Rechazar
                            </button>
                        </div>
                    )}

                    {reservaSeleccionada.estado === 'PENDIENTE' && mostrandoRechazo && (
                        <div className="flex flex-col gap-3">
                            <textarea
                                value={motivoRechazoTexto}
                                onChange={(e) => setMotivoRechazoTexto(e.target.value)}
                                placeholder="Motivo del rechazo (opcional)"
                                rows={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                            />
                            <div className="flex gap-3 self-start">
                                <button
                                    onClick={() => rechazarReservaAccion(reservaSeleccionada.id, motivoRechazoTexto)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Confirmar rechazo
                                </button>
                                <button
                                    onClick={() => setMostrandoRechazo(false)}
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    )
}

export default Admin
