import { useState, useEffect, useContext  } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { AuthContext } from '../context/AuthContext'
import Modal from '../components/Modal'
import FormularioPost from '../components/FormularioPost'
import AvatarUsuario from '../components/AvatarUsuario'

function Feed() {
    const [posts, setPosts] = useState([])
    const { usuario } = useContext(AuthContext)
    const [postAEliminar, setPostAEliminar] = useState(null)

    async function cargarPosts(){
        const respuesta = await fetch('http://localhost:3000/api/posts')
        const datos = await respuesta.json()
        setPosts(datos)
    }

    async function eliminarPost(id) {
        setPostAEliminar(id)
    }

    async function confirmarEliminar() {
        const respuesta = await fetch(`http://localhost:3000/api/posts/${postAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (respuesta.ok) {
            setPostAEliminar(null)
            cargarPosts()
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPosts()
}, [])

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {usuario && (
                <h1 className="text-2xl font-bold text-volare-azul mb-6">Hola, {usuario.nombre}</h1>
            )}
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
                {usuario && (
                    <aside className="sticky top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                        <AvatarUsuario foto={usuario.foto} size={96} className="mx-auto" />
                        <div className="border-b border-gray-200" />
                        <p className="text-sm text-gray-600 text-center">{usuario.bio}</p>
                        <Link
                            to={`/perfil/${usuario.id}`}
                            className="bg-volare-azul text-white px-4 py-2 rounded-lg text-sm font-semibold text-center hover:opacity-90 transition"
                        >
                            Ver perfil
                        </Link>
                    </aside>
                )}

                <div className="flex flex-col gap-6">
                    {usuario && (
                        <FormularioPost origen="feed" onPublicado={cargarPosts} />
                    )}

                    <div className="flex flex-col gap-4">
                        {posts.map(post => <PostCard key={post.id} post={post} usuario={usuario} eliminar={eliminarPost} onEditar={cargarPosts} contexto="feed" />)}
                    </div>

                    {postAEliminar && (
                        <Modal onClose={() => setPostAEliminar(null)}>
                            <div className="flex flex-col items-center text-center gap-4 border border-red-200 rounded-xl p-4">
                                <p className="text-gray-700">¿Estás seguro de eliminar este post?</p>
                                <div className="flex gap-3">
                                    <button onClick={confirmarEliminar} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">
                                        Sí, eliminar
                                    </button>
                                    <button onClick={() => setPostAEliminar(null)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Feed
