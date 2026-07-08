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
import { HiXMark, HiOutlineEye } from 'react-icons/hi2'

function PerfilPublico() {
    const { id } = useParams()
    const [usuario, setUsuario] = useState(null)
    const [posts, setPosts] = useState([])
    const [nombre, setNombre] = useState('')
    const [bio, setBio] = useState('')
    const [foto, setFoto] = useState(null)
    const [fotoPreview, setFotoPreview] = useState(null)
    const [eliminarFoto, setEliminarFoto] = useState(false)
    const [modalPerfilAbierto, setModalPerfilAbierto] = useState(false)
    const [modalCrearPostAbierto, setModalCrearPostAbierto] = useState(false)
    const [passwordActual, setPasswordActual] = useState('')
    const [passwordNueva, setPasswordNueva] = useState('')
    const [confirmarPassword, setConfirmarPassword] = useState('')
    const [emailNuevo, setEmailNuevo] = useState('')
    const [passwordParaEmail, setPasswordParaEmail] = useState('')
    const [modalSeguridadAbierto, setModalSeguridadAbierto] = useState(false)
    const [postAEliminar, setPostAEliminar] = useState(null)

    const { usuario: usuarioLogueado, setUsuario: setUsuarioLogueado } = useContext(AuthContext)
    const { mostrarToast } = useToast()

    const cargarPerfilPublico = useCallback(async () => {
        const respuesta = await fetch(`http://localhost:3000/api/usuarios/${id}`)
        const datos = await respuesta.json()
        setUsuario(datos.user)
        setNombre(datos.user.nombre)
        setBio(datos.user.bio || '')
        setPosts(datos.posts)
    }, [id])

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

    function abrirModalEditarPerfil() {
        setFoto(null)
        setFotoPreview(null)
        setEliminarFoto(false)
        setModalPerfilAbierto(true)
    }

    function manejarFoto(archivo) {
        if (!archivo) return
        setFoto(archivo)
        setFotoPreview(URL.createObjectURL(archivo))
        setEliminarFoto(false)
    }

    function quitarFoto() {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview)
        setFoto(null)
        setFotoPreview(null)
        setEliminarFoto(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData()
        if (foto) {
            formData.append('foto', foto)
        } else if (eliminarFoto) {
            formData.append('eliminarFoto', 'true')
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
            const datos = await respuesta.json()
            setUsuarioLogueado(datos.user)
            setFoto(null)
            setFotoPreview(null)
            setEliminarFoto(false)
            setModalPerfilAbierto(false)
            mostrarToast('Perfil actualizado', 'exito')
            cargarPerfilPublico()
        } else {
            mostrarToast('No se pudo actualizar el perfil', 'error')
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
        mostrarToast('Contraseña actualizada', 'exito')
    } else {
        const datos = await respuesta.json()
        mostrarToast(datos.mensaje || 'No se pudo actualizar la contraseña', 'error')
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
            mostrarToast('Email actualizado', 'exito')
        } else {
            const datos = await respuesta.json()
            mostrarToast(datos.mensaje || 'No se pudo actualizar el email', 'error')
        }
    }

    const esPropioPerfil = usuarioLogueado?.id === usuario?.id
    const fotoAMostrarEnPreview = eliminarFoto ? null : (fotoPreview || usuario?.foto)

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-6 items-start">
                {usuario && (
                    <div className="w-full md:sticky md:top-24 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                            <AvatarUsuario foto={usuario.foto} size={96} className="mx-auto border border-gray-200 shadow-sm" />
                            <div className="border-b border-gray-200" />
                            <div className="text-center">
                                <h2 className="text-xl font-bold text-volare-azul">{usuario.nombre}</h2>
                                <p className="text-gray-600 text-sm mt-1">{usuario.bio}</p>
                                <p className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-2">
                                    <HiOutlineEye size={14} />
                                    {usuario.visitasPerfil ?? 0} visitas
                                </p>
                            </div>
                        </div>

                        {esPropioPerfil && (
                            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                                <div className="flex flex-col divide-y divide-gray-200">
                                    <div className="pb-4">
                                        <button
                                            onClick={abrirModalEditarPerfil}
                                            className="bg-volare-azul text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition w-full"
                                        >
                                            Editar Perfil
                                        </button>
                                        <p className="text-sm text-gray-500 mt-1">Actualiza tu nombre, biografía y foto de perfil</p>
                                    </div>
                                    <div className="py-4">
                                        <button
                                            onClick={() => setModalSeguridadAbierto(true)}
                                            className="bg-volare-verde text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition w-full"
                                        >
                                            Seguridad
                                        </button>
                                        <p className="text-sm text-gray-500 mt-1">Cambia tu contraseña o correo electrónico</p>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            onClick={() => setModalCrearPostAbierto(true)}
                                            className="bg-volare-naranja text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition w-full"
                                        >
                                            Crear Publicación
                                        </button>
                                        <p className="text-sm text-gray-500 mt-1">Comparte una publicación en tu perfil</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col gap-4 w-full">
                    {posts.map(post => <PostCard key={post.id} post={post} usuario={usuarioLogueado} eliminar={eliminarPost} onEditar={cargarPerfilPublico} contexto="perfil" />)}
                </div>
            </div>

            {usuario && (
                <>
                    {modalSeguridadAbierto && (
                        <Modal onClose={() => setModalSeguridadAbierto(false)}>
                            <h3 className="text-lg font-bold text-volare-azul">Cambiar Contraseña</h3>
                            <form onSubmit={handleSubmitPassword} className="flex flex-col gap-4">
                                <input type="password" value={passwordActual} onChange={(e) => setPasswordActual(e.target.value)} placeholder="Contraseña actual" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <input type="password" value={passwordNueva} onChange={(e) => setPasswordNueva(e.target.value)} placeholder="Nueva contraseña" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <input type="password" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} placeholder="Confirmar contraseña" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <button type="submit" className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                    Cambiar Contraseña
                                </button>
                            </form>
                            <div className="border-t border-gray-100" />
                            <h3 className="text-lg font-bold text-volare-azul">Cambiar Email</h3>
                            <form onSubmit={handleSubmitEmail} className="flex flex-col gap-4">
                                <input type="email" value={emailNuevo} onChange={(e) => setEmailNuevo(e.target.value)} placeholder="Nuevo email" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <input type="password" value={passwordParaEmail} onChange={(e) => setPasswordParaEmail(e.target.value)} placeholder="Confirma tu contraseña" className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <button type="submit" className="bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                    Cambiar Email
                                </button>
                            </form>
                        </Modal>
                    )}
                    {modalPerfilAbierto && (
                        <Modal onClose={() => setModalPerfilAbierto(false)}>
                            <h3 className="text-lg font-bold text-volare-azul">Editar Perfil</h3>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="relative w-24 h-24 mx-auto">
                                    <AvatarUsuario foto={fotoAMostrarEnPreview} size={96} />
                                    {fotoAMostrarEnPreview && (
                                        <Tooltip texto="Quitar foto" className="absolute -top-2 -right-2">
                                            <button
                                                type="button"
                                                onClick={quitarFoto}
                                                className="bg-white rounded-full shadow p-0.5 text-gray-600 hover:text-red-500 flex items-center justify-center"
                                                aria-label="Quitar foto"
                                            >
                                                <HiXMark size={14} />
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => manejarFoto(e.target.files[0])}
                                    className="text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-volare-azul file:text-white file:font-semibold hover:file:opacity-90"
                                />
                                <input type="text" value={nombre} placeholder="Nombre" onChange={(e) => setNombre(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul" />
                                <textarea
                                    value={bio}
                                    placeholder="Cuéntanos algo sobre ti"
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={3}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                                />
                                <button type="submit" className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                                    Guardar Cambios
                                </button>
                            </form>
                        </Modal>
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
