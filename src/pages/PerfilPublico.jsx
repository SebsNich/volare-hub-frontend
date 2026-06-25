import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    
    useEffect(() => {
        async function cargarPerfilPublico(){
            const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`)
            const datos = await respuesta.json()
            setUsuario(datos.user)
            setPosts(datos.posts)
        }
        cargarPerfilPublico()
    }, [id])

    return (
        <div>
            {usuario && (
                <div>
                    <h2>{usuario.nombre}</h2>
                    <p>{usuario.bio}</p>
                    <img src={usuario.foto} />
                </div>
            )}

            {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
    )
}

export default PerfilPublico