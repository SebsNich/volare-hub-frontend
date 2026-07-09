import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import {
    HiOutlineUsers,
    HiOutlineInbox,
    HiBars3,
    HiXMark,
    HiOutlineChartBar,
    HiOutlineDocumentText,
    HiOutlineUserGroup,
    HiOutlineBuildingOffice2,
    HiOutlineEnvelope
} from 'react-icons/hi2'
import { normalizarTexto } from '../utilities/helpers'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const SECCIONES = [
    { id: 'resumen', label: 'Resumen', icono: HiOutlineChartBar },
    { id: 'usuarios', label: 'Usuarios', icono: HiOutlineUsers },
    { id: 'sugerencias', label: 'Buzón de Sugerencias', icono: HiOutlineInbox },
]

const TARJETAS_RESUMEN = [
    { id: 'publicacionesTotales', label: 'Publicaciones totales', icono: HiOutlineDocumentText, color: 'text-volare-azul' },
    { id: 'residentesActivos', label: 'Residentes activos', icono: HiOutlineUserGroup, color: 'text-volare-verde' },
    { id: 'obrasActivas', label: 'Obras activas', icono: HiOutlineBuildingOffice2, color: 'text-volare-naranja' },
    { id: 'mensajesSinLeer', label: 'Mensajes sin leer', icono: HiOutlineEnvelope, color: 'text-volare-morado' },
]

const TIPOS_SUGERENCIA = [
    { value: 'SUGERENCIA', label: 'Sugerencia' },
    { value: 'QUEJA', label: 'Queja' },
    { value: 'CONSULTA', label: 'Consulta' },
    { value: 'OTRO', label: 'Otro' },
]

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
    const [paginaSugerencias, setPaginaSugerencias] = useState(1)

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

    async function cargarUsuarios() {
        const respuesta = await fetch(`${API_URL}/api/usuarios`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setUsuarios(datos.usuarios)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarResumen()
        cargarUsuarios()
        cargarSugerencias()
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
        return coincideNombre && coincideTipo
    })
    const totalPaginasSugerencias = Math.max(1, Math.ceil(sugerenciasFiltradas.length / TAMANO_PAGINA))
    const paginaSugerenciasEfectiva = Math.min(paginaSugerencias, totalPaginasSugerencias)
    const sugerenciasPagina = sugerenciasFiltradas.slice((paginaSugerenciasEfectiva - 1) * TAMANO_PAGINA, paginaSugerenciasEfectiva * TAMANO_PAGINA)

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                                <td className="px-4 py-3 font-medium text-volare-azul whitespace-nowrap">{sugerencia.nombre || 'Anónimo'}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{sugerencia.tipo}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(sugerencia.creadoEn).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${sugerencia.estado === 'SIN_LEER' ? 'text-volare-naranja' : 'text-volare-verde'}`}>
                                                        <span className={`w-2 h-2 rounded-full ${sugerencia.estado === 'SIN_LEER' ? 'bg-volare-naranja' : 'bg-volare-verde'}`} />
                                                        {sugerencia.estado === 'SIN_LEER' ? 'No leído' : 'Leído'}
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
                </div>
            </div>

            {sugerenciaSeleccionada && (
                <Modal onClose={() => setSugerenciaSeleccionada(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">{sugerenciaSeleccionada.nombre || 'Anónimo'}</h3>
                    <span className="self-start px-2 py-0.5 rounded-full text-xs font-semibold text-white bg-volare-azul">
                        {sugerenciaSeleccionada.tipo}
                    </span>
                    <p className="text-gray-600">{sugerenciaSeleccionada.mensaje}</p>
                    <p className="text-xs text-gray-400">{sugerenciaSeleccionada.estado}</p>
                    <p className="text-xs text-gray-400">{new Date(sugerenciaSeleccionada.creadoEn).toLocaleDateString()}</p>
                    {sugerenciaSeleccionada.estado === 'SIN_LEER' && (
                        <button
                            onClick={() => marcarLeida(sugerenciaSeleccionada.id)}
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition self-start"
                        >
                            Marcar como leída
                        </button>
                    )}
                </Modal>
            )}
        </div>
    )
}

export default Admin
