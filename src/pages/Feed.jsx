import { useState, useEffect } from 'react'
import PostCard from '../components/PostCard'

function Feed() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        async function cargarPosts(){
            const respuesta = await fetch('http://localhost:3000/api/posts')
            const datos = await respuesta.json()
            setPosts(datos)
        }
        cargarPosts()
    }, [])

    return (
        <div>
            {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
    )
}

export default Feed