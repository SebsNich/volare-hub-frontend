import { useState, useEffect } from 'react'

function Admin() {
    const [usuarios, setUsuarios] = useState([])

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

    return (
        <div>
            <h1>Panel de Administración</h1>

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
        </div>
    )
}

export default Admin