import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import { HiOutlineUsers, HiOutlineInbox, HiBars3, HiXMark } from 'react-icons/hi2'

const SECCIONES = [
    { id: 'usuarios', label: 'Usuarios', icono: HiOutlineUsers },
    { id: 'sugerencias', label: 'Buzón de Sugerencias', icono: HiOutlineInbox },
]

function Admin() {
    const [usuarios, setUsuarios] = useState([])
    const [nombreAdmin, setNombreAdmin] = useState('')
    const [emailAdmin, setEmailAdmin] = useState('')
    const [passwordAdmin, setPasswordAdmin] = useState('')
    const [modalCrearAdminAbierto, setModalCrearAdminAbierto] = useState(false)
    const [sugerencias, setSugerencias] = useState([])
    const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(null)
    const [seccionActiva, setSeccionActiva] = useState('usuarios')
    const [menuAbierto, setMenuAbierto] = useState(false)

    async function cargarSugerencias() {
        const respuesta = await fetch('http://localhost:3000/api/buzon', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setSugerencias(datos)
    }

    async function marcarLeida(id) {
        const respuesta = await fetch(`http://localhost:3000/api/buzon/${id}/leida`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (respuesta.ok) {
            cargarSugerencias()
            setSugerenciaSeleccionada(null)
        }
    }

    async function cargarUsuarios() {
        const respuesta = await fetch('http://localhost:3000/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json()
        setUsuarios(datos.usuarios)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarUsuarios()
        cargarSugerencias()
    }, [])

    async function cambiarEstado(usuarioId, activoActual) {
        const respuesta = await fetch(`http://localhost:3000/api/usuarios/${usuarioId}/estado`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ activo: !activoActual })
        })

        if (respuesta.ok) {
            cargarUsuarios()
        }
    }

    async function crearAdmin(e) {
        e.preventDefault()

        const respuesta = await fetch('http://localhost:3000/api/usuarios/crear-admin', {
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
            cargarUsuarios()
        }
    }

    function seleccionarSeccion(id) {
        setSeccionActiva(id)
        setMenuAbierto(false)
    }

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
                    {seccionActiva === 'usuarios' && (
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
                                    {usuarios.map(usuario => (
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
                                </tbody>
                            </table>
                        </div>
                    )}

                    {seccionActiva === 'sugerencias' && (
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
                                            <td className="px-4 py-3 font-medium text-volare-azul whitespace-nowrap">{sugerencia.nombre}</td>
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
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {sugerenciaSeleccionada && (
                <Modal onClose={() => setSugerenciaSeleccionada(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">{sugerenciaSeleccionada.nombre}</h3>
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
