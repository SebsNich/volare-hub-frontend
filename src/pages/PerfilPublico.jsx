import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useCallback } from 'react'
import Modal from '../components/Modal'
import BotonSugerencia from '../components/BotonSugerencia'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    const [nombre, setNombre] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)
    const [passwordActual, setPasswordActual] = useState('')
    const [passwordNueva, setPasswordNueva] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [emailNuevo, setEmailNuevo] = useState('')
    const [passwordParaEmail, setPasswordParaEmail] = useState('')
    const [modalSeguridadAbierto, setModalSeguridadAbierto] = useState(false)

    const { usuario: usuarioLogueado } = useContext(AuthContext) 
    
    const cargarPerfilPublico = useCallback(async () => {
        const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`)
        const datos = await respuesta.json()
        setUsuario(datos.user)
        setNombre(datos.user.nombre)
        setBio(datos.user.bio || '')
        setPosts(datos.posts)
    }, [id])

    async function eliminarPost(id) {
        const confirmado = confirm('¿Estás seguro de eliminar este post?')
        
        if (confirmado) {
            const respuesta = await fetch(`http://localhost:3000/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (respuesta.ok) {
                cargarPerfilPublico()
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPerfilPublico()
    }, [id, cargarPerfilPublico])

    async function handleSubmit(e) {
        e.preventDefault()
        
        const formData = new FormData()
        if (foto) {
            formData.append('foto', foto)
        }
        formData.append('nombre', nombre)
        formData.append('bio', bio)

        const respuesta = await fetch(`http://localhost:3000/api/auth/editar-perfil`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        
        if (respuesta.ok) {
            setModalPerfilAbierto(false)
            cargarPerfilPublico()
        }
    }

    async function handleSubmitPassword(e) {
    e.preventDefault()
    
    if (passwordNueva !== confirmarPassword) {
        alert('Las contraseñas no coinciden')
        return
    }
    
    const respuesta = await fetch('http://localhost:3000/api/auth/cambiar-password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ passwordActual, passwordNuevo: passwordNueva })
    })

    if (respuesta.ok) {
        setPasswordActual('')
        setPasswordNueva('')
        setConfirmarPassword('')
        alert('Contraseña actualizada correctamente')
    }
}

    async function handleSubmitEmail(e) {
        e.preventDefault()
        
        const respuesta = await fetch('http://localhost:3000/api/auth/cambiar-email', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ emailNuevo, passwordActual: passwordParaEmail })
        })
        
        if (respuesta.ok) {
            setEmailNuevo('')
            setPasswordParaEmail('')
            alert('Email actualizado correctamente')
        }
    }

    return (
        <div>
            {usuario && (
                <>
                    <div>
                        <h2>{usuario.nombre}</h2>
                        <p>{usuario.bio}</p>
                        <img src={usuario.foto} />
                    </div>
                    {usuarioLogueado?.id === usuario.id && (
                        <>
                            <button onClick={() => setModalPerfilAbierto(true)}>Editar Perfil</button>
                            <button onClick={() => setModalSeguridadAbierto(true)}>Seguridad</button>
                        </>
                    )}
                    {modalSeguridadAbierto && (
                        <Modal onClose={() => setModalSeguridadAbierto(false)}>
                            <h3>Cambiar Contraseña</h3>
                            <form onSubmit={handleSubmitPassword}>
                                <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} placeholder="Contraseña actual" />
                                <input type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} placeholder="Nueva contraseña" />
                                <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} placeholder="Confirmar contraseña" />
                                <button type="submit">Cambiar Contraseña</button>
                            </form>
                            <h3>Cambiar Email</h3>
                            <form onSubmit={handleSubmitEmail}>
                                <input type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} placeholder="Nuevo email" />
                                <input type="password" value={passwordParaEmail} onChange={(e) => setPasswordParaEmail(e.target.value)} placeholder="Confirma tu contraseña" />
                                <button type="submit">Cambiar Email</button>
                            </form>
                        </Modal>
                    )}
                    {modalPerfilAbierto && (
                        <Modal onClose={() => setModalPerfilAbierto(false)}>
                            <form onSubmit={handleSubmit}>
                                <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
                                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                                <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
                                <button type="submit">Guardar Cambios</button>
                            </form>
                        </Modal>
                    )}
                </>
            )}
            {posts.map(post => <PostCard key={post.id} post={post} usuario={usuarioLogueado} eliminar={eliminarPost} onEditar={cargarPerfilPublico} />)}

            <BotonSugerencia />
        </div>
    )
}

export default PerfilPublico