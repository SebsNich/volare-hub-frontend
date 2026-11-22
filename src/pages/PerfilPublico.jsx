import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useParams } from 'react-router-dom'
import PostCard from '../components/PostCard'
import { useCallback } from 'react'
import Modal from '../components/Modal'
import FormularioPost from '../components/FormularioPost'
import AvatarUsuario from '../components/AvatarUsuario'
import Tooltip from '../components/Tooltip'
import FiltroTipoPublicacion, { obtenerMensajeVacio } from '../components/FiltroTipoPublicacion'
import { HiOutlineEye, HiOutlinePencil, HiOutlineShieldCheck, HiOutlinePencilSquare } from 'react-icons/hi2'
import { API_URL } from '../config/api'
import { nombreCompleto, esCuentaPendiente } from '../utilities/helpers'
import ModalEditarPerfil from '../components/ModalEditarPerfil'
import ModalSeguridad from '../components/ModalSeguridad'
import { textoUbicacion } from '../utilities/perfil'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)
    const [modalCrearPostAbierto, setModalCrearPostAbierto] = useState(false)
    const [modalSeguridadAbierto, setModalSeguridadAbierto] = useState(false)
    const [postAEliminar, setPostAEliminar] = useState(null)
    const [filtroTipo, setFiltroTipo] = useState('TODOS')
    const [errorPerfil, setErrorPerfil] = useState('')

    const { usuario: usuarioLogueado } = useContext(AuthContext)
    const { mostrarToast } = useToast()

    const cargarPerfilPublico = useCallback(async () => {
        const respuesta = await fetch(`${API_URL}/api/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const datos = await respuesta.json().catch(() => ({}))
        // Sin esto, un 403 (por ejemplo, una cuenta pendiente que abre un perfil
        // ajeno) rompía la página al leer datos.user, que no viene.
        if (!respuesta.ok) {
            setErrorPerfil(datos.mensaje || 'No se pudo cargar el perfil')
            return
        }
        setErrorPerfil('')
        setUsuario(datos.user)
        setPosts(datos.posts)
    }, [id])

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
            cargarPerfilPublico()
        } else {
            mostrarToast('No se pudo eliminar la publicación', 'error')
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPerfilPublico()
    }, [id, cargarPerfilPublico])

    const esPropioPerfil = usuarioLogueado?.id === usuario?.id
    const esAdmin = usuarioLogueado?.rol === 'ADMIN'
    const puedePublicar = !esCuentaPendiente(usuarioLogueado)
    const ubicacion = textoUbicacion(usuario)
    const postsFiltrados = filtroTipo === 'TODOS' ? posts : posts.filter(post => post.tipo === filtroTipo)

    if (errorPerfil) {
        return (
            <div className="max-w-xl mx-auto px-4 py-16">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center text-gray-600">
                    {errorPerfil}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr_240px] gap-6 items-start">
                {usuario && (
                    <div className="order-2 md:order-1 w-full md:sticky md:top-24 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                            <AvatarUsuario foto={usuario.foto} size={96} className="mx-auto border border-gray-200 shadow-sm" />
                            <div className="border-b border-gray-200" />
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-volare-azul">{nombreCompleto(usuario)}</h2>
                                {ubicacion && (
                                    <p className="text-sm font-medium text-gray-500 mt-1">{ubicacion}</p>
                                )}
                                <p className="text-gray-600 text-sm mt-1">{usuario.bio}</p>
                                <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-2">
                                    <HiOutlineEye size={14} />
                                    {usuario.visitasPerfil ?? 0} visitas
                                </p>
                            </div>
                        </div>

                        {esPropioPerfil && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
                                {puedePublicar && (
                                    <div>
                                        <Tooltip texto="Comparte algo con los residentes" posicion="abajo" className="w-full [&>div]:block [&>div]:w-full">
                                            <button
                                                onClick={() => setModalCrearPostAbierto(true)}
                                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-volare-naranja to-amber-400 text-white px-4 py-3 rounded-xl text-base font-bold shadow-lg shadow-orange-200 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-volare-naranja"
                                            >
                                                <HiOutlinePencilSquare size={22} />
                                                Crear publicación
                                            </button>
                                        </Tooltip>
                                        <p className="text-xs text-gray-500 mt-1.5 text-center">Comparte una publicación en tu perfil</p>
                                    </div>
                                )}
                                <div className={`flex flex-col gap-2 ${puedePublicar ? 'pt-3 border-t border-gray-100' : ''}`}>
                                    <Tooltip texto="Nombre, foto, biografía y celular" posicion="abajo" className="[&>div]:block [&>div]:w-full">
                                        <button
                                            onClick={() => setModalPerfilAbierto(true)}
                                            className="w-full flex items-center justify-center gap-1.5 border border-volare-azul text-volare-azul px-3 py-2 rounded-lg text-sm font-semibold hover:bg-volare-azul/10 transition"
                                        >
                                            <HiOutlinePencil size={16} /> Editar perfil
                                        </button>
                                    </Tooltip>
                                    <Tooltip texto="Contraseña y correo de acceso" posicion="abajo" className="[&>div]:block [&>div]:w-full">
                                        <button
                                            onClick={() => setModalSeguridadAbierto(true)}
                                            className="w-full flex items-center justify-center gap-1.5 border border-volare-verde text-green-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-volare-verde/10 transition"
                                        >
                                            <HiOutlineShieldCheck size={16} /> Seguridad
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="order-1 md:order-2 flex flex-col gap-4 w-full">
                    {postsFiltrados.map(post => <PostCard key={post.id} post={post} usuario={usuarioLogueado} eliminar={eliminarPost} onEditar={cargarPerfilPublico} contexto="perfil" />)}
                    {postsFiltrados.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center text-gray-400">
                            {obtenerMensajeVacio(filtroTipo)}
                        </div>
                    )}
                </div>

                {esAdmin && (
                    <FiltroTipoPublicacion filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo} />
                )}
            </div>

            {usuario && (
                <>
                    {modalSeguridadAbierto && <ModalSeguridad onClose={() => setModalSeguridadAbierto(false)} />}
                    {modalPerfilAbierto && (
                        <ModalEditarPerfil
                            usuario={usuario}
                            onClose={() => setModalPerfilAbierto(false)}
                            onGuardado={() => {
                                setModalPerfilAbierto(false)
                                cargarPerfilPublico()
                            }}
                        />
                    )}
                    {modalCrearPostAbierto && (
                        <Modal onClose={() => setModalCrearPostAbierto(false)}>
                            <FormularioPost
                                origen="perfil"
                                enModal
                                onPublicado={() => {
                                    setModalCrearPostAbierto(false)
                                    cargarPerfilPublico()
                                }}
                            />
                        </Modal>
                    )}
                </>
            )}

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
    )
}

export default PerfilPublico
