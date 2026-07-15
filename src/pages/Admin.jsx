import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import ArchivoAdjunto from '../components/ArchivoAdjunto'
import ControlesPaginacion from '../components/ControlesPaginacion'
import Tooltip from '../components/Tooltip'
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
    HiOutlineExclamationTriangle,
    HiOutlineChatBubbleLeftEllipsis,
    HiOutlineGlobeAlt,
    HiOutlinePencil,
    HiOutlineTrash,
    HiChevronUp,
    HiChevronDown
} from 'react-icons/hi2'
import { formatearFechaReserva, nombreCompleto } from '../utilities/helpers'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA, PLATAFORMAS_RED_SOCIAL, ICONO_PLATAFORMA } from '../utilities/constantes'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import useDebounce from '../hooks/useDebounce'

const SECCIONES = [
    { id: 'resumen', label: 'Resumen', icono: HiOutlineChartBar },
    { id: 'usuarios', label: 'Usuarios', icono: HiOutlineUsers },
    { id: 'sugerencias', label: 'Buzón de Sugerencias', icono: HiOutlineInbox },
    { id: 'reservas', label: 'Gestión de Reservas', icono: HiOutlineCalendarDays },
    { id: 'landing', label: 'Landing Page', icono: HiOutlineGlobeAlt },
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

function listaArchivos(urls, etiqueta) {
    if (!urls?.length) return null
    return urls.map((url, index) => (
        <ArchivoAdjunto key={url} nombre={urls.length > 1 ? `${etiqueta} ${index + 1}` : etiqueta} href={url} />
    ))
}

function obtenerIniciales(usuario) {
    const partes = nombreCompleto(usuario).split(/\s+/).filter(Boolean)
    if (partes.length === 0) return '??'
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
    return (partes[0][0] + partes[1][0]).toUpperCase()
}

function Admin() {
    const { mostrarToast } = useToast()
    const [usuarios, setUsuarios] = useState([])
    const [nombresAdmin, setNombresAdmin] = useState('')
    const [apellidosAdmin, setApellidosAdmin] = useState('')
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
    const [totalPaginasUsuarios, setTotalPaginasUsuarios] = useState(1)
    const busquedaUsuariosDebounced = useDebounce(busquedaUsuarios)

    const [busquedaSugerencias, setBusquedaSugerencias] = useState('')
    const [filtroTipoSugerencia, setFiltroTipoSugerencia] = useState('TODOS')
    const [mostrarArchivadas, setMostrarArchivadas] = useState(false)
    const [paginaSugerencias, setPaginaSugerencias] = useState(1)
    const [totalPaginasSugerencias, setTotalPaginasSugerencias] = useState(1)
    const busquedaSugerenciasDebounced = useDebounce(busquedaSugerencias)

    const [reservas, setReservas] = useState([])
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
    const [confirmacionAccion, setConfirmacionAccion] = useState(null)
    const [motivoRechazoTexto, setMotivoRechazoTexto] = useState('')
    const [observacionTexto, setObservacionTexto] = useState('')
    const [busquedaReservas, setBusquedaReservas] = useState('')
    const [filtroEspacioReserva, setFiltroEspacioReserva] = useState('TODOS')
    const [filtroEstadoReserva, setFiltroEstadoReserva] = useState('TODOS')
    const [filtroFechaReserva, setFiltroFechaReserva] = useState('')
    const [paginaReservas, setPaginaReservas] = useState(1)
    const [totalPaginasReservas, setTotalPaginasReservas] = useState(1)
    const busquedaReservasDebounced = useDebounce(busquedaReservas)

    const [contactos, setContactos] = useState([])
    const [modalContactoAbierto, setModalContactoAbierto] = useState(null)
    const [contactoAEliminar, setContactoAEliminar] = useState(null)

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
        const params = new URLSearchParams({ pagina: paginaSugerencias })
        if (busquedaSugerenciasDebounced) params.set('busqueda', busquedaSugerenciasDebounced)
        if (filtroTipoSugerencia !== 'TODOS') params.set('tipo', filtroTipoSugerencia)
        if (mostrarArchivadas) params.set('archivadas', 'true')

        const respuesta = await fetch(`${API_URL}/api/buzon?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setSugerencias(datos.sugerencias)
        setTotalPaginasSugerencias(datos.totalPaginas)
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
        const params = new URLSearchParams({ pagina: paginaUsuarios })
        if (busquedaUsuariosDebounced) params.set('busqueda', busquedaUsuariosDebounced)
        if (filtroManzanaVilla) params.set('manzanaVilla', filtroManzanaVilla)
        if (filtroEstadoUsuario !== 'TODOS') params.set('estado', filtroEstadoUsuario)

        const respuesta = await fetch(`${API_URL}/api/usuarios?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setUsuarios(datos.usuarios)
        setTotalPaginasUsuarios(datos.totalPaginas)
    }

    async function cargarReservas() {
        const params = new URLSearchParams({ pagina: paginaReservas })
        if (busquedaReservasDebounced) params.set('busqueda', busquedaReservasDebounced)
        if (filtroEspacioReserva !== 'TODOS') params.set('espacio', filtroEspacioReserva)
        if (filtroEstadoReserva !== 'TODOS') params.set('estado', filtroEstadoReserva)
        if (filtroFechaReserva) params.set('fecha', filtroFechaReserva)

        const respuesta = await fetch(`${API_URL}/api/reservas?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setReservas(datos.reservas)
        setTotalPaginasReservas(datos.totalPaginas)
    }

    async function cargarContactos() {
        const respuesta = await fetch(`${API_URL}/api/contacto/admin`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setContactos(datos)
    }

    function abrirModalContacto(tipo, contacto = null) {
        setModalContactoAbierto({
            tipo,
            id: contacto?.id ?? null,
            etiqueta: contacto?.etiqueta ?? '',
            plataforma: contacto?.plataforma ?? PLATAFORMAS_RED_SOCIAL[0].value,
            valor: contacto?.valor ?? ''
        })
    }

    async function guardarContacto(e) {
        e.preventDefault()
        const { tipo, id, etiqueta, plataforma, valor } = modalContactoAbierto

        const respuesta = await fetch(`${API_URL}/api/contacto${id ? `/${id}` : ''}`, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ tipo, etiqueta, plataforma, valor })
        })

        if (respuesta.ok) {
            mostrarToast(id ? 'Registro actualizado' : 'Registro agregado', 'exito')
            setModalContactoAbierto(null)
            cargarContactos()
        } else {
            const datos = await respuesta.json().catch(() => ({}))
            mostrarToast(datos.error || 'No se pudo guardar el registro', 'error')
        }
    }

    async function eliminarContactoConfirmado() {
        const respuesta = await fetch(`${API_URL}/api/contacto/${contactoAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (respuesta.ok) {
            mostrarToast('Registro eliminado', 'exito')
            setContactoAEliminar(null)
            cargarContactos()
        } else {
            mostrarToast('No se pudo eliminar el registro', 'error')
        }
    }

    async function moverContacto(id, direccion) {
        const respuesta = await fetch(`${API_URL}/api/contacto/${id}/orden`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ direccion })
        })

        if (respuesta.ok) {
            cargarContactos()
        } else {
            mostrarToast('No se pudo cambiar el orden', 'error')
        }
    }

    function filaContacto(contacto, lista) {
        const indice = lista.findIndex(c => c.id === contacto.id)
        const Icono = contacto.tipo === 'RED_SOCIAL' ? ICONO_PLATAFORMA[contacto.plataforma] : null
        return (
            <div key={contacto.id} className="flex items-center justify-between gap-3 border-b border-gray-50 last:border-0 py-2">
                <div className="flex items-center gap-2 min-w-0">
                    {Icono && <Icono size={18} className="text-volare-azul shrink-0" />}
                    <div className="min-w-0">
                        {contacto.etiqueta && <p className="text-xs text-gray-400 truncate">{contacto.etiqueta}</p>}
                        <p className="text-sm text-gray-700 truncate">{contacto.valor}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        type="button"
                        disabled={indice === 0}
                        onClick={() => moverContacto(contacto.id, 'subir')}
                        className="text-gray-400 hover:text-volare-azul disabled:opacity-30 disabled:cursor-not-allowed transition"
                        aria-label="Subir"
                    >
                        <HiChevronUp size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={indice === lista.length - 1}
                        onClick={() => moverContacto(contacto.id, 'bajar')}
                        className="text-gray-400 hover:text-volare-azul disabled:opacity-30 disabled:cursor-not-allowed transition"
                        aria-label="Bajar"
                    >
                        <HiChevronDown size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => abrirModalContacto(contacto.tipo, contacto)}
                        className="text-volare-azul hover:opacity-70 transition-opacity"
                        aria-label="Editar"
                    >
                        <HiOutlinePencil size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setContactoAEliminar(contacto.id)}
                        className="text-red-500 hover:opacity-70 transition-opacity"
                        aria-label="Eliminar"
                    >
                        <HiOutlineTrash size={16} />
                    </button>
                </div>
            </div>
        )
    }

    function abrirModalReserva(reserva) {
        setReservaSeleccionada(reserva)
        setConfirmacionAccion(null)
        setMotivoRechazoTexto('')
        setObservacionTexto('')
    }

    function cerrarModalReserva() {
        setReservaSeleccionada(null)
        setConfirmacionAccion(null)
        setMotivoRechazoTexto('')
        setObservacionTexto('')
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
            const datos = await respuesta.json().catch(() => ({}))
            mostrarToast(datos.error || 'No se pudo aprobar la reserva', 'error')
        }
    }

    async function rechazarReservaAccion(id, motivo) {
        if (!motivo.trim()) {
            mostrarToast('Debes indicar el motivo del rechazo', 'error')
            return
        }

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
            const datos = await respuesta.json().catch(() => ({}))
            mostrarToast(datos.error || 'No se pudo rechazar la reserva', 'error')
        }
    }

    async function enviarObservacionAccion(id, observacion) {
        if (!observacion.trim()) {
            mostrarToast('Debes escribir la observación', 'error')
            return
        }

        const respuesta = await fetch(`${API_URL}/api/reservas/${id}/observacion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ observacion })
        })
        if (respuesta.ok) {
            mostrarToast('Observación enviada al residente', 'exito')
            cargarReservas()
            cerrarModalReserva()
        } else {
            const datos = await respuesta.json().catch(() => ({}))
            mostrarToast(datos.error || 'No se pudo enviar la observación', 'error')
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarResumen()
        cargarContactos()
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaUsuarios(1)
    }, [busquedaUsuariosDebounced])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarUsuarios()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaUsuarios, busquedaUsuariosDebounced, filtroManzanaVilla, filtroEstadoUsuario])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaSugerencias(1)
    }, [busquedaSugerenciasDebounced])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarSugerencias()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaSugerencias, busquedaSugerenciasDebounced, filtroTipoSugerencia, mostrarArchivadas])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPaginaReservas(1)
    }, [busquedaReservasDebounced])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarReservas()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginaReservas, busquedaReservasDebounced, filtroEspacioReserva, filtroEstadoReserva, filtroFechaReserva])

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
                nombres: nombresAdmin,
                apellidos: apellidosAdmin,
                email: emailAdmin,
                password: passwordAdmin
            })
        })

        if (respuesta.ok) {
            setNombresAdmin('')
            setApellidosAdmin('')
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

    const telefonos = contactos.filter(c => c.tipo === 'TELEFONO')
    const correos = contactos.filter(c => c.tipo === 'CORREO')
    const redesSociales = contactos.filter(c => c.tipo === 'RED_SOCIAL')

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
                            value={nombresAdmin}
                            onChange={(e) => setNombresAdmin(e.target.value)}
                            placeholder="Nombres"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <input
                            type="text"
                            value={apellidosAdmin}
                            onChange={(e) => setApellidosAdmin(e.target.value)}
                            placeholder="Apellidos"
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
                                    onChange={(e) => setBusquedaUsuarios(e.target.value)}
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
                                            <th className="px-4 py-3 whitespace-nowrap">Cédula</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Celular</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Rol</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Manzana/Villa</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map(usuario => (
                                            <tr key={usuario.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                                <td className="px-4 py-3 font-semibold text-volare-azul whitespace-nowrap">{nombreCompleto(usuario)}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{usuario.email}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{usuario.cedula || '—'}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{usuario.celular || '—'}</td>
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
                                        {usuarios.length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron usuarios con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaUsuarios}
                                    totalPaginas={totalPaginasUsuarios}
                                    onAnterior={() => setPaginaUsuarios(paginaUsuarios - 1)}
                                    onSiguiente={() => setPaginaUsuarios(paginaUsuarios + 1)}
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
                                    onChange={(e) => setBusquedaSugerencias(e.target.value)}
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
                                        {sugerencias.map(sugerencia => (
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
                                        {sugerencias.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron sugerencias con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaSugerencias}
                                    totalPaginas={totalPaginasSugerencias}
                                    onAnterior={() => setPaginaSugerencias(paginaSugerencias - 1)}
                                    onSiguiente={() => setPaginaSugerencias(paginaSugerencias + 1)}
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
                                    onChange={(e) => setBusquedaReservas(e.target.value)}
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
                                <input
                                    type="date"
                                    value={filtroFechaReserva}
                                    onChange={(e) => { setFiltroFechaReserva(e.target.value); setPaginaReservas(1) }}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-44"
                                />
                                {filtroFechaReserva && (
                                    <button
                                        type="button"
                                        onClick={() => { setFiltroFechaReserva(''); setPaginaReservas(1) }}
                                        className="text-sm text-gray-500 hover:text-volare-azul whitespace-nowrap px-1"
                                    >
                                        Limpiar filtro
                                    </button>
                                )}
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                            <th className="px-4 py-3 whitespace-nowrap">Residente</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Manzana/Villa</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Espacio</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Horario</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Monto total</th>
                                            <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservas.map(reserva => {
                                            const estilo = ESTILOS_ESTADO_RESERVA[reserva.estado]
                                            return (
                                                <tr
                                                    key={reserva.id}
                                                    onClick={() => abrirModalReserva(reserva)}
                                                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                                                >
                                                    <td className="px-4 py-3 font-semibold text-volare-azul whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            {reserva.nombres} {reserva.apellidos}
                                                            {reserva.usuario.rol === 'ADMIN' && (
                                                                <Tooltip texto={`Registrado por administrador: ${nombreCompleto(reserva.usuario)} de la cuenta admin`}>
                                                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold shrink-0">
                                                                        {obtenerIniciales(reserva.usuario)}
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Mz. {reserva.manzana} Villa {reserva.villa}</td>
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
                                                            {reserva.observacionAdmin && (
                                                                <HiOutlineChatBubbleLeftEllipsis
                                                                    size={16}
                                                                    className="text-volare-naranja shrink-0"
                                                                    aria-label="Tiene observación"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {reservas.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                                                    No se encontraron reservas con esos filtros
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <ControlesPaginacion
                                    paginaActual={paginaReservas}
                                    totalPaginas={totalPaginasReservas}
                                    onAnterior={() => setPaginaReservas(paginaReservas - 1)}
                                    onSiguiente={() => setPaginaReservas(paginaReservas + 1)}
                                />
                            </div>
                        </div>
                    )}

                    {seccionActiva === 'landing' && (
                        <div className="flex flex-col gap-4">
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Teléfonos</h3>
                                <div className="flex flex-col">
                                    {telefonos.map(c => filaContacto(c, telefonos))}
                                    {telefonos.length === 0 && (
                                        <p className="text-sm text-gray-400 py-2">Sin teléfonos registrados</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => abrirModalContacto('TELEFONO')}
                                    className="mt-3 text-sm text-volare-azul font-semibold hover:underline"
                                >
                                    + Agregar
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Correos</h3>
                                <div className="flex flex-col">
                                    {correos.map(c => filaContacto(c, correos))}
                                    {correos.length === 0 && (
                                        <p className="text-sm text-gray-400 py-2">Sin correos registrados</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => abrirModalContacto('CORREO')}
                                    className="mt-3 text-sm text-volare-azul font-semibold hover:underline"
                                >
                                    + Agregar
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Redes Sociales</h3>
                                <div className="flex flex-col">
                                    {redesSociales.map(c => filaContacto(c, redesSociales))}
                                    {redesSociales.length === 0 && (
                                        <p className="text-sm text-gray-400 py-2">Sin redes sociales registradas</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => abrirModalContacto('RED_SOCIAL')}
                                    className="mt-3 text-sm text-volare-azul font-semibold hover:underline"
                                >
                                    + Agregar
                                </button>
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

                    {reservaSeleccionada.observacionAdmin && (
                        <div className="bg-orange-50 border border-volare-naranja/40 rounded-lg p-3 flex items-start gap-2">
                            <HiOutlineChatBubbleLeftEllipsis size={20} className="text-volare-naranja shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-volare-naranja">Observación enviada:</span> {reservaSeleccionada.observacionAdmin}
                            </p>
                        </div>
                    )}

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

                    {reservaSeleccionada.usuario.rol === 'ADMIN' && (
                        <p className="text-sm text-gray-500 italic">
                            Registrado presencialmente por: {nombreCompleto(reservaSeleccionada.usuario)}
                        </p>
                    )}

                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p><span className="font-semibold text-gray-700">Residente (cuenta):</span> {nombreCompleto(reservaSeleccionada.usuario)}</p>
                        <p><span className="font-semibold text-gray-700">Manzana/Villa:</span> Mz. {reservaSeleccionada.manzana} Villa {reservaSeleccionada.villa}</p>
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
                        {listaArchivos(reservaSeleccionada.comprobantePagoUrls, 'Comprobante de pago')}
                        {listaArchivos(reservaSeleccionada.listaInvitadosUrls, 'Lista de invitados')}
                        {listaArchivos(reservaSeleccionada.contratoFirmadoUrls, 'Contrato firmado')}
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

                    {reservaSeleccionada.estado === 'PENDIENTE' && (
                        <div className="flex flex-wrap gap-3 self-start">
                            <button
                                onClick={() => setConfirmacionAccion('aprobar')}
                                className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Aprobar
                            </button>
                            <button
                                onClick={() => setConfirmacionAccion('rechazar')}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Rechazar
                            </button>
                            <button
                                onClick={() => setConfirmacionAccion('observacion')}
                                className="bg-volare-naranja text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Enviar Observación
                            </button>
                        </div>
                    )}
                </Modal>
            )}

            {confirmacionAccion && (
                <Modal onClose={() => setConfirmacionAccion(null)}>
                    {confirmacionAccion === 'aprobar' && (
                        <>
                            <h3 className="text-lg font-bold text-volare-azul">Confirmar aprobación</h3>
                            <p className="text-sm text-gray-600">¿Confirmas que deseas aprobar esta reserva?</p>
                            <div className="flex gap-3 self-start">
                                <button
                                    onClick={() => aprobarReservaAccion(reservaSeleccionada.id)}
                                    className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Sí, aprobar
                                </button>
                                <button
                                    onClick={() => setConfirmacionAccion(null)}
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    )}

                    {confirmacionAccion === 'rechazar' && (
                        <>
                            <h3 className="text-lg font-bold text-volare-azul">Confirmar rechazo</h3>
                            <textarea
                                value={motivoRechazoTexto}
                                onChange={(e) => setMotivoRechazoTexto(e.target.value)}
                                placeholder="Motivo del rechazo (obligatorio)"
                                rows={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                            />
                            <div className="flex gap-3 self-start">
                                <button
                                    onClick={() => rechazarReservaAccion(reservaSeleccionada.id, motivoRechazoTexto)}
                                    disabled={!motivoRechazoTexto.trim()}
                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                        motivoRechazoTexto.trim()
                                            ? 'bg-red-500 text-white hover:opacity-90 cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Sí, rechazar
                                </button>
                                <button
                                    onClick={() => setConfirmacionAccion(null)}
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    )}

                    {confirmacionAccion === 'observacion' && (
                        <>
                            <h3 className="text-lg font-bold text-volare-azul">Enviar observación</h3>
                            <textarea
                                value={observacionTexto}
                                onChange={(e) => setObservacionTexto(e.target.value)}
                                placeholder="Escribe la observación para el residente (obligatorio)"
                                rows={3}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                            />
                            <div className="flex gap-3 self-start">
                                <button
                                    onClick={() => enviarObservacionAccion(reservaSeleccionada.id, observacionTexto)}
                                    disabled={!observacionTexto.trim()}
                                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                                        observacionTexto.trim()
                                            ? 'bg-volare-naranja text-white hover:opacity-90 cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Enviar
                                </button>
                                <button
                                    onClick={() => setConfirmacionAccion(null)}
                                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </>
                    )}
                </Modal>
            )}

            {modalContactoAbierto && (
                <Modal onClose={() => setModalContactoAbierto(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">
                        {modalContactoAbierto.id ? 'Editar' : 'Agregar'}{' '}
                        {modalContactoAbierto.tipo === 'TELEFONO' ? 'Teléfono' : modalContactoAbierto.tipo === 'CORREO' ? 'Correo' : 'Red Social'}
                    </h3>
                    <form onSubmit={guardarContacto} className="flex flex-col gap-4">
                        {modalContactoAbierto.tipo === 'RED_SOCIAL' ? (
                            <>
                                <select
                                    value={modalContactoAbierto.plataforma}
                                    onChange={(e) => setModalContactoAbierto({ ...modalContactoAbierto, plataforma: e.target.value })}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                                >
                                    {PLATAFORMAS_RED_SOCIAL.map(p => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    value={modalContactoAbierto.valor}
                                    onChange={(e) => setModalContactoAbierto({ ...modalContactoAbierto, valor: e.target.value })}
                                    placeholder="URL (https://...)"
                                    required
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                                />
                            </>
                        ) : (
                            <>
                                <input
                                    type="text"
                                    value={modalContactoAbierto.etiqueta}
                                    onChange={(e) => setModalContactoAbierto({ ...modalContactoAbierto, etiqueta: e.target.value })}
                                    placeholder="Etiqueta (opcional, ej. Administración)"
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                                />
                                <input
                                    type={modalContactoAbierto.tipo === 'CORREO' ? 'email' : 'text'}
                                    value={modalContactoAbierto.valor}
                                    onChange={(e) => setModalContactoAbierto({ ...modalContactoAbierto, valor: e.target.value })}
                                    placeholder={modalContactoAbierto.tipo === 'CORREO' ? 'Correo' : 'Número de teléfono'}
                                    required
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                                />
                            </>
                        )}
                        <button
                            type="submit"
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Guardar
                        </button>
                    </form>
                </Modal>
            )}

            {contactoAEliminar && (
                <Modal onClose={() => setContactoAEliminar(null)}>
                    <div className="flex flex-col items-center text-center gap-4 border border-red-200 rounded-xl p-4">
                        <p className="text-gray-700">¿Estás seguro de eliminar este registro?</p>
                        <div className="flex gap-3">
                            <button onClick={eliminarContactoConfirmado} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">
                                Sí, eliminar
                            </button>
                            <button onClick={() => setContactoAEliminar(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default Admin
