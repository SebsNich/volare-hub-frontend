import { useState, useEffect, useContext  } from 'react'
import { Link } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from '../components/Modal'
import FormularioPost from '../components/FormularioPost'
import AvatarUsuario from '../components/AvatarUsuario'
import FiltroTipoPublicacion, { obtenerMensajeVacio } from '../components/FiltroTipoPublicacion'
import { HiOutlinePhone, HiOutlineMapPin, HiOutlineEye } from 'react-icons/hi2'
import { FaFacebook, FaInstagram } from 'react-icons/fa6'
import { formatearMesAnio } from '../utilities/helpers'
import { API_URL } from '../config/api'

function Feed() {
    const [posts, setPosts] = useState([])
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [postAEliminar, setPostAEliminar] = useState(null)
    const [filtroTipo, setFiltroTipo] = useState('TODOS')

    const postsFiltrados = filtroTipo === 'TODOS' ? posts : posts.filter(post => post.tipo === filtroTipo)

    async function cargarPosts(){
        const respuesta = await fetch(`${API_URL}/api/posts`)
        const datos = await respuesta.json()
        setPosts(datos)
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
            cargarPosts()
        } else {
            mostrarToast('No se pudo eliminar la publicación', 'error')
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPosts()
}, [])

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {usuario && (
                <h1 className="text-2xl font-bold text-volare-azul mb-6">Hola, {usuario.nombre}</h1>
            )}
            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr_240px] gap-6 items-start">
                <aside className="w-full md:sticky md:top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                    {usuario ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-gray-600 text-center font-medium">
                                Urbanización Volare - Tu comunidad, tu hogar
                            </p>
                            <img
                                src="/logo-volare.png"
                                alt="Urbanización Volare"
                                className="rounded-xl w-full object-cover"
                            />

                            <div className="flex items-center justify-center gap-4 border-t border-gray-100 pt-3 mt-3">
                                <a
                                    href="https://www.facebook.com/pages/Urbanizacion%20Volare/1235766146472618/"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Facebook"
                                    className="text-volare-azul hover:opacity-70 transition-opacity"
                                >
                                    <FaFacebook size={22} />
                                </a>
                                <a
                                    href="https://www.instagram.com/urbanizacionvolare/"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label="Instagram"
                                    className="text-volare-azul hover:opacity-70 transition-opacity"
                                >
                                    <FaInstagram size={22} />
                                </a>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 text-center border-t border-gray-100 pt-3 mt-3">
                                <HiOutlinePhone size={18} className="text-volare-azul shrink-0" />
                                Contacto administración: +593 99 999 9999
                            </div>

                            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 mt-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-volare-azul">
                                    <HiOutlineMapPin size={18} />
                                    Ubicación
                                </div>
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.2672871234304!2d-79.91228681975285!3d-2.0490014702949377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d130073dd52bb%3A0x53d14c338bbbff71!2sUrbanizaci%C3%B3n%20Volare!5e0!3m2!1ses-419!2sec!4v1783443664759!5m2!1ses-419!2sec"
                                    className="w-full h-40 rounded-lg border-0"
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                />
                                <a
                                    href="https://share.google/IQY3iORzwP4EO7Jl0"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-volare-azul hover:underline text-center"
                                >
                                    Ver en Google Maps
                                </a>
                            </div>
                        </>
                    )}
                </aside>

                <div className="flex flex-col gap-6 w-full">
                    {usuario && (
                        <FormularioPost origen="feed" onPublicado={cargarPosts} />
                    )}

                    <div className="flex flex-col gap-4">
                        {postsFiltrados.map(post => <PostCard key={post.id} post={post} usuario={usuario} eliminar={eliminarPost} onEditar={cargarPosts} contexto="feed" />)}
                        {postsFiltrados.length === 0 && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center text-gray-400">
                                {obtenerMensajeVacio(filtroTipo)}
                            </div>
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
