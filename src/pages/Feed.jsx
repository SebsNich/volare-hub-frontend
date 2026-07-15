import { useState, useEffect, useContext  } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import FormularioPost from '../components/FormularioPost'
import AvatarUsuario from '../components/AvatarUsuario'
import MiniLandingCompleta from '../components/MiniLandingCompleta'
import FiltroTipoPublicacion, { obtenerMensajeVacio } from '../components/FiltroTipoPublicacion'
import { HiOutlineEye } from 'react-icons/hi2'
import { formatearMesAnio, nombreCompleto } from '../utilities/helpers'
import { API_URL } from '../config/api'

function Feed() {
    const [posts, setPosts] = useState([])
    const [paginaFeed, setPaginaFeed] = useState(1)
    const [hayMasPosts, setHayMasPosts] = useState(false)
    const [cargandoMas, setCargandoMas] = useState(false)
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [postAEliminar, setPostAEliminar] = useState(null)
    const [filtroTipo, setFiltroTipo] = useState('TODOS')

    const postsFiltrados = filtroTipo === 'TODOS' ? posts : posts.filter(post => post.tipo === filtroTipo)

    async function cargarPosts(pagina = 1){
        const respuesta = await fetch(`${API_URL}/api/posts?pagina=${pagina}`)
        const datos = await respuesta.json()
        setPosts(anteriores => pagina === 1 ? datos.posts : [...anteriores, ...datos.posts])
        setHayMasPosts(datos.hayMas)
        setPaginaFeed(pagina)
    }

    async function cargarMasPosts() {
        setCargandoMas(true)
        await cargarPosts(paginaFeed + 1)
        setCargandoMas(false)
    }

    async function eliminarPost(id) {
        setPostAEliminar(id)
    }

    async function confirmarEliminar() {
        const respuesta = await fetch(`${API_URL}/api/posts/${postAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (respuesta.ok) {
            setPostAEliminar(null)
            mostrarToast('Publicación eliminada', 'exito')
            cargarPosts(1)
        } else {
            mostrarToast('No se pudo eliminar la publicación', 'error')
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPosts(1)
}, [filtroTipo])

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {usuario && (
                <h1 className="text-2xl font-bold text-volare-azul mb-6">Hola, {nombreCompleto(usuario)}</h1>
            )}
            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr_240px] gap-6 items-start">
                <aside className="w-full md:sticky md:top-24 flex flex-col gap-6">
                    {usuario ? (
                        <>
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                                <AvatarUsuario foto={usuario.foto} size={96} className="mx-auto" />
                                <div className="border-b border-gray-200" />
                                <p className="text-sm text-gray-600 text-center">{usuario.bio}</p>
                                <div className="flex flex-col items-center gap-1 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <HiOutlineEye size={14} />
                                        {usuario.visitasPerfil ?? 0} visitas
                                    </span>
                                    <span>Miembro desde {formatearMesAnio(usuario.creadoEn)}</span>
                                </div>
                                <Link
                                    to={`/perfil/${usuario.id}`}
                                    className="bg-volare-azul text-white px-4 py-2 rounded-lg text-sm font-semibold text-center hover:opacity-90 transition"
                                >
                                    Ver perfil
                                </Link>
                            </div>
                            <MiniLandingCompleta />
                        </>
                    ) : (
                        <MiniLandingCompleta />
                    )}
                </aside>

                <div className="flex flex-col gap-6 w-full">
                    {usuario && (
                        <FormularioPost origen="feed" onPublicado={() => cargarPosts(1)} />
                    )}

                    <div className="flex flex-col gap-4">
                        {postsFiltrados.map(post => <PostCard key={post.id} post={post} usuario={usuario} eliminar={eliminarPost} onEditar={() => cargarPosts(1)} contexto="feed" />)}
                        {postsFiltrados.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center text-gray-400">
                                {obtenerMensajeVacio(filtroTipo)}
                            </div>
                        )}
                        {hayMasPosts && (
                            <button
                                type="button"
                                onClick={cargarMasPosts}
                                disabled={cargandoMas}
                                className={`self-center px-6 py-2 rounded-lg text-sm font-semibold border transition ${
                                    cargandoMas
                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                        : 'bg-white text-volare-azul border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {cargandoMas ? 'Cargando...' : 'Cargar más'}
                            </button>
                        )}
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

                <FiltroTipoPublicacion filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
            </div>
        </div>
    )
}

export default Feed
