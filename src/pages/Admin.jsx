import { useState, useEffect } from 'react'
import Modal from '../components/Modal'

function Admin() {
    const [usuarios, setUsuarios] = useState([])
    const [nombreAdmin, setNombreAdmin] = useState('')
    const [emailAdmin, setEmailAdmin] = useState('')
    const [passwordAdmin, setPasswordAdmin] = useState('')
    const [modalCrearAdminAbierto, setModalCrearAdminAbierto] = useState(false)
    const [sugerencias, setSugerencias] = useState([])
    const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(null)

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

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-volare-azul">Panel de Administración</h1>
                <button
                    onClick={() => setModalCrearAdminAbierto(true)}
                    className="bg-volare-azul text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
                >
                    Crear Admin
                </button>
            </div>

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

            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold text-volare-azul">Usuarios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {usuarios.map(usuario => (
                        <div key={usuario.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-volare-azul">{usuario.nombre}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${usuario.activo ? 'bg-volare-verde' : 'bg-gray-400'}`}>
                                    {usuario.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">{usuario.email}</p>
                            <p className="text-xs text-gray-400">{usuario.rol} · Mz. {usuario.manzana} Villa {usuario.villa}</p>
                            <button
                                onClick={() => cambiarEstado(usuario.id, usuario.activo)}
                                className="self-start mt-2 bg-volare-naranja text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition"
                            >
                                {usuario.activo ? 'Desactivar' : 'Activar'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold text-volare-azul">Buzón de Sugerencias</h2>
                <div className="flex flex-col gap-2">
                    {sugerencias.map(sugerencia => (
                        <div
                            key={sugerencia.id}
                            onClick={() => setSugerenciaSeleccionada(sugerencia)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:shadow-md transition"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${sugerencia.estado === 'SIN_LEER' ? 'bg-volare-naranja' : 'bg-volare-verde'}`} />
                                <p className="font-medium text-volare-azul">{sugerencia.nombre}</p>
                                <span className="text-xs text-gray-400">{sugerencia.tipo}</span>
                            </div>
                            <p className="text-xs text-gray-400">{new Date(sugerencia.creadoEn).toLocaleDateString()}</p>
                        </div>
                    ))}
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