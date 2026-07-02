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
        <div>
            <h1>Panel de Administración</h1>

            <button onClick={() => setModalCrearAdminAbierto(true)}>Crear Admin</button>

            {modalCrearAdminAbierto && (
                <Modal onClose={() => setModalCrearAdminAbierto(false)}>
                    <form onSubmit={crearAdmin}>
                        <input type="text" value={nombreAdmin} onChange={(e) => setNombreAdmin(e.target.value)} placeholder="Nombre" />
                        <input type="email" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} placeholder="Email" />
                        <input type="password" value={passwordAdmin} onChange={(e) => setPasswordAdmin(e.target.value)} placeholder="Contraseña" />
                        <button type="submit">Crear Admin</button>
                    </form>
                </Modal>
            )}

            {usuarios.map(usuario => (
                <div key={usuario.id}>
                    <p>{usuario.nombre}</p>
                    <p>{usuario.email}</p>
                    <p>{usuario.rol}</p>
                    <p>{usuario.manzana}</p>
                    <p>{usuario.villa}</p>
                    <p>{usuario.activo ? 'Activo' : 'Inactivo'}</p>
                    <button onClick={() => cambiarEstado(usuario.id, usuario.activo)}>
                        {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                </div>
            ))}

            <h2>Buzón de Sugerencias</h2>
            {sugerencias.map(sugerencia => (
                <div key={sugerencia.id} onClick={() => setSugerenciaSeleccionada(sugerencia)}>
                    <p>{sugerencia.nombre}</p>
                    <p>{sugerencia.tipo}</p>
                    <p>{sugerencia.estado}</p>
                    <p>{new Date(sugerencia.creadoEn).toLocaleDateString()}</p>
                </div>
            ))}

            {sugerenciaSeleccionada && (
                <Modal onClose={() => setSugerenciaSeleccionada(null)}>
                    <h3>{sugerenciaSeleccionada.nombre}</h3>
                    <p>{sugerenciaSeleccionada.tipo}</p>
                    <p>{sugerenciaSeleccionada.mensaje}</p>
                    <p>{sugerenciaSeleccionada.estado}</p>
                    <p>{new Date(sugerenciaSeleccionada.creadoEn).toLocaleDateString()}</p>
                    {sugerenciaSeleccionada.estado === 'SIN_LEER' && (
                        <button onClick={() => marcarLeida(sugerenciaSeleccionada.id)}>
                            Marcar como leída
                        </button>
                    )}
                </Modal>
            )}
        </div>
    )
}

export default Admin