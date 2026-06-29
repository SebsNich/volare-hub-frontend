import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useCallback } from 'react'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    const { usuario: usuarioLogueado } = useContext(AuthContext) 
    
    const cargarPerfilPublico = useCallback(async () => {
        const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`)
        const datos = await respuesta.json()
        setUsuario(datos.user)
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

    return (
        <div>
            {usuario && (
                <div>
                    <h2>{usuario.nombre}</h2>
                    <p>{usuario.bio}</p>
                    <img src={usuario.foto} />
                </div>
            )}

            {posts.map(post => <PostCard key={post.id} post={post} usuario={usuarioLogueado} eliminar={eliminarPost} />)}
        </div>
    )
}

export default PerfilPublico