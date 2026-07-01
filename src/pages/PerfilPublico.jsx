import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useCallback } from 'react'
import Modal from '../components/Modal'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    const [nombre, setNombre] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)
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
        formData.append('nombre', nombre)
        formData.append('foto', foto)
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
                        <button onClick={() => setModalPerfilAbierto(true)}>Editar Perfil</button>
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
        </div>
    )
}

export default PerfilPublico