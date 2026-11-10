import { Link } from "react-router-dom"
import { useState } from "react"
import { HiOutlinePencil, HiOutlineTrash, HiChevronLeft, HiChevronRight, HiOutlineMapPin, HiMapPin, HiOutlinePhoto, HiOutlineDocumentText, HiPlusSmall, HiXMark, HiOutlineGlobeAlt, HiOutlineRectangleStack } from "react-icons/hi2"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import Modal from './Modal'
import ArchivoAdjunto from './ArchivoAdjunto'
import Tooltip from './Tooltip'
import Interruptor from './Interruptor'
import AvatarUsuario from './AvatarUsuario'
import obtenerNombreArchivo, { nombreCompleto } from "../utilities/helpers"
import { tipoColores } from "../utilities/constantes"
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const LIMITE_DESCRIPCION = 200

// Repite la regla del backend solo para explicar en pantalla por qué el
// interruptor está apagado; quien decide de verdad sigue siendo el backend.
function motivoSinCarrusel(post) {
    if (!post.publico) return 'Primero hazla pública'
    if (post.estado !== 'ACTIVO') return 'Solo publicaciones activas'
    if (post.imagenUrl.length === 0) return 'Necesita al menos una imagen'
    return null
}

// En móvil solo se ve el icono para no apretar la cabecera; el title da el texto.
function InsigniaEstado({ icono: Icono, texto }) {
    return (
        <span title={texto} className="flex items-center gap-1 text-xs font-medium text-volare-verde">
            <Icono size={14} />
            <span className="hidden sm:inline">{texto}</span>
        </span>
    )
}

function PostCard({ post, usuario, eliminar, onEditar, contexto = 'feed' }) {
    const { mostrarToast } = useToast()
    const esAdmin = usuario?.rol === 'ADMIN'
    // El autor también ve las insignias: si edita un post público, vuelve a privado.
    const veEstadoPublicacion = esAdmin || usuario?.id === post.autorId
    const motivoCarrusel = motivoSinCarrusel(post)
    const [confirmarPublicoAbierto, setConfirmarPublicoAbierto] = useState(false)
    const [guardandoPublicacion, setGuardandoPublicacion] = useState(false)
    const puedeEditar = usuario && (usuario.id === post.autorId || usuario.rol === 'ADMIN')
    const puedeAnclar = contexto === 'perfil'
        ? usuario && usuario.id === post.autorId
        : usuario && usuario.rol === 'ADMIN'
    const ancladoActivo = contexto === 'perfil' ? post.ancladoPerfil : post.anclado
    const descripcionLarga = post.descripcion.length > LIMITE_DESCRIPCION
    const [descripcionExpandida, setDescripcionExpandida] = useState(false)
    const [imagenIndex, setImagenIndex] = useState(0)
    const [lightboxAbierto, setLightboxAbierto] = useState(false)
    const [modalAbierto, setModalAbierto] = useState(false)
    const [titulo, setTitulo] = useState(post.titulo)
    const [descripcion, setDescripcion] = useState(post.descripcion)
    const [tipo, setTipo] = useState(post.tipo)
    const [imagenesAEliminar, setImagenesAEliminar] = useState([])
    const [imagenesNuevas, setImagenesNuevas] = useState([])
    const [nuevasImagenesPreview, setNuevasImagenesPreview] = useState([])
    const [archivosAEliminar, setArchivosAEliminar] = useState([])
    const [archivosNuevos, setArchivosNuevos] = useState([])

    function manejarNuevasImagenes(archivos) {
        const listaArchivos = Array.from(archivos)
        setImagenesNuevas(listaArchivos)
        setNuevasImagenesPreview(listaArchivos.map(archivo => URL.createObjectURL(archivo)))
    }

    function quitarImagenNueva(index) {
        URL.revokeObjectURL(nuevasImagenesPreview[index])
        setImagenesNuevas(imagenesNuevas.filter((_, i) => i !== index))
        setNuevasImagenesPreview(nuevasImagenesPreview.filter((_, i) => i !== index))
    }

    function quitarArchivoNuevo(index) {
        setArchivosNuevos(archivosNuevos.filter((_, i) => i !== index))
    }

    async function toggleAnclado() {
        const endpoint = contexto === 'perfil' ? 'anclar-perfil' : 'anclar'
        const respuesta = await fetch(`${API_URL}/api/posts/${post.id}/${endpoint}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (respuesta.ok) {
            mostrarToast(ancladoActivo ? 'Publicación desanclada' : 'Publicación anclada', 'exito')
            onEditar()
        } else {
            mostrarToast('No se pudo anclar la publicación', 'error')
        }
    }

    async function enviarCambioPublicacion(ruta, cuerpo, mensajeExito) {
        setGuardandoPublicacion(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/posts/${post.id}/${ruta}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cuerpo)
            })
            if (respuesta.ok) {
                mostrarToast(mensajeExito, 'exito')
                onEditar()
            } else {
                const datos = await respuesta.json().catch(() => ({}))
                mostrarToast(datos.error || datos.mensaje || 'No se pudo actualizar la publicación', 'error')
            }
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setGuardandoPublicacion(false)
        }
    }

    function alternarPublico() {
        if (!post.publico) {
            setConfirmarPublicoAbierto(true)
            return
        }
        const mensaje = post.enCarrusel
            ? 'La publicación ahora es privada y salió del carrusel'
            : 'La publicación ahora es privada'
        enviarCambioPublicacion('publico', { publico: false }, mensaje)
    }

    function confirmarHacerPublico() {
        setConfirmarPublicoAbierto(false)
        enviarCambioPublicacion('publico', { publico: true }, 'La publicación ahora es pública')
    }

    function alternarCarrusel() {
        const mensaje = post.enCarrusel ? 'Publicación quitada del carrusel' : 'Publicación agregada al carrusel'
        enviarCambioPublicacion('carrusel', { enCarrusel: !post.enCarrusel }, mensaje)
    }

    const imagenesVisibles = post.imagenUrl.filter(url => !imagenesAEliminar.includes(url))
    const archivosVisibles = post.archivoUrl.filter(url => !archivosAEliminar.includes(url))

    async function handleSubmit(e) {
        e.preventDefault()
        
        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descripcion', descripcion)
        formData.append('tipo', tipo)
        imagenesAEliminar.forEach(url => {
            formData.append('imagenesAEliminar', url)
        })
        archivosAEliminar.forEach(url => {
            formData.append('archivosAEliminar', url)
        })
        imagenesNuevas.forEach(imagen => {
            formData.append('imagenes', imagen)
        })
        archivosNuevos.forEach(archivo => {
            formData.append('archivos', archivo)
        })
        
        const respuesta = await fetch(`${API_URL}/api/posts/${post.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })

        if (respuesta.ok) {
            setModalAbierto(false)
            mostrarToast('Publicación actualizada', 'exito')
            onEditar()
        } else {
            mostrarToast('No se pudo actualizar la publicación', 'error')
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 flex flex-col gap-2.5 sm:gap-3 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
                <Link to={`/perfil/${post.autorId}`} className="flex items-center gap-2 text-sm font-semibold text-volare-azul hover:underline min-w-0">
                    <AvatarUsuario foto={post.autor.foto} size={28} />
                    <span className="truncate">{nombreCompleto(post.autor)}</span>
                </Link>
                <div className="flex items-center gap-2 shrink-0">
                    {ancladoActivo && (
                        <span className="hidden sm:flex items-center gap-1 text-xs font-medium text-volare-azul">
                            <HiMapPin size={14} />
                            Anclado
                        </span>
                    )}
                    {veEstadoPublicacion && post.publico && (
                        <InsigniaEstado icono={HiOutlineGlobeAlt} texto="Público" />
                    )}
                    {veEstadoPublicacion && post.enCarrusel && (
                        <InsigniaEstado icono={HiOutlineRectangleStack} texto="Carrusel" />
                    )}
                    <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-white ${tipoColores[post.tipo] || 'bg-gray-400'}`}>
                        {post.tipo}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            <h2 className="text-lg sm:text-xl font-bold text-volare-azul">{post.titulo}</h2>
            <p className={`text-sm sm:text-base text-gray-600 leading-relaxed ${descripcionLarga && !descripcionExpandida ? 'line-clamp-3' : ''}`}>
                {post.descripcion}
            </p>
            {descripcionLarga && (
                <button
                    type="button"
                    onClick={() => setDescripcionExpandida(!descripcionExpandida)}
                    className="text-volare-azul font-semibold cursor-pointer text-sm self-start -mt-1 sm:-mt-2"
                >
                    {descripcionExpandida ? 'Leer menos' : 'Leer más...'}
                </button>
            )}
            <p className="text-xs text-gray-400">{new Date(post.creadoEn).toLocaleDateString()}</p>

            {post.imagenUrl.length === 1 && (
                <img
                    src={post.imagenUrl[0]}
                    onClick={() => setLightboxAbierto(true)}
                    className="w-full h-56 sm:h-72 object-contain rounded-xl border border-gray-200 shadow-sm bg-gray-50 mt-1 cursor-pointer"
                />
            )}

            {post.imagenUrl.length > 1 && (
                <div className="relative mt-1">
                    <img
                        src={post.imagenUrl[imagenIndex]}
                        onClick={() => setLightboxAbierto(true)}
                        className="w-full h-56 sm:h-72 object-contain rounded-xl border border-gray-200 shadow-sm bg-gray-50 cursor-pointer"
                    />
                    <button
                        type="button"
                        onClick={() => setImagenIndex((imagenIndex - 1 + post.imagenUrl.length) % post.imagenUrl.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition"
                        aria-label="Imagen anterior"
                    >
                        <HiChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setImagenIndex((imagenIndex + 1) % post.imagenUrl.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition"
                        aria-label="Imagen siguiente"
                    >
                        <HiChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {post.imagenUrl.map((_, i) => (
                            <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${i === imagenIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </div>
            )}

            <Lightbox
                open={lightboxAbierto}
                close={() => setLightboxAbierto(false)}
                slides={post.imagenUrl.map(url => ({ src: url }))}
                index={imagenIndex}
                on={{ view: ({ index }) => setImagenIndex(index) }}
                plugins={[Zoom]}
            />

            {post.archivoUrl.length > 0 && (
                <div className="flex flex-col gap-2">
                    {post.archivoUrl.map(url => (
                        <ArchivoAdjunto key={url} nombre={obtenerNombreArchivo(url)} href={url} />
                    ))}
                </div>
            )}

            {(puedeEditar || puedeAnclar) && (
                <div className="flex flex-wrap items-center gap-4 sm:gap-3 mt-1 sm:mt-2 pt-3 border-t border-gray-100/70">
                    {puedeAnclar && (
                        <Tooltip texto={contexto === 'perfil' ? 'Anclar en mi perfil' : 'Anclar en el feed'}>
                            <button
                                onClick={toggleAnclado}
                                className="text-volare-azul hover:opacity-70 transition-opacity"
                                aria-label={ancladoActivo ? 'Desanclar' : 'Anclar'}
                            >
                                {ancladoActivo ? <HiMapPin size={20} /> : <HiOutlineMapPin size={20} />}
                            </button>
                        </Tooltip>
                    )}
                    {puedeEditar && (
                        <>
                            <Tooltip texto="Editar publicación">
                                <button
                                    onClick={() => setModalAbierto(true)}
                                    className="text-volare-azul hover:opacity-70 transition-opacity"
                                    aria-label="Editar"
                                >
                                    <HiOutlinePencil size={20} />
                                </button>
                            </Tooltip>
                            <Tooltip texto="Eliminar publicación">
                                <button
                                    onClick={() => eliminar(post.id)}
                                    className="text-red-500 hover:opacity-70 transition-opacity"
                                    aria-label="Eliminar"
                                >
                                    <HiOutlineTrash size={20} />
                                </button>
                            </Tooltip>
                        </>
                    )}
                    {esAdmin && (
                        <div className="flex gap-2 ml-auto">
                            <Tooltip texto={post.publico ? 'Quitar de la página pública' : 'Mostrar en la página pública'}>
                                <Interruptor
                                    etiqueta="Público"
                                    activo={post.publico}
                                    onCambiar={alternarPublico}
                                    deshabilitado={guardandoPublicacion}
                                />
                            </Tooltip>
                            <Tooltip texto={motivoCarrusel || (post.enCarrusel ? 'Quitar del carrusel' : 'Mostrar en el carrusel')}>
                                <Interruptor
                                    etiqueta="Carrusel"
                                    activo={post.enCarrusel}
                                    onCambiar={alternarCarrusel}
                                    deshabilitado={guardandoPublicacion || Boolean(motivoCarrusel)}
                                />
                            </Tooltip>
                        </div>
                    )}
                </div>
            )}

            {confirmarPublicoAbierto && (
                <Modal onClose={() => setConfirmarPublicoAbierto(false)}>
                    <h3 className="text-lg font-bold text-volare-azul">¿Hacer pública esta publicación?</h3>
                    <p className="text-sm text-gray-600">
                        Será visible para cualquier persona en la página pública de Volare, sin necesidad de iniciar sesión.
                    </p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setConfirmarPublicoAbierto(false)}
                            className="px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmarHacerPublico}
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Publicar
                        </button>
                    </div>
                </Modal>
            )}

            {modalAbierto && (
                <Modal onClose={() => setModalAbierto(false)}>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <h2 className="text-xl font-semibold text-volare-azul mb-4">Editar Publicación</h2>
                        <input
                            type="text"
                            value={titulo}
                            placeholder="Escribe el título de la publicación"
                            onChange={(e) => setTitulo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul ${tipo === '' ? 'text-gray-400' : 'text-volare-azul'}`}
                        >
                            <option value="" disabled hidden>Seleccione un tipo</option>
                            {usuario.rol === 'RESIDENTE' ? (
                                <option value="EMPRENDIMIENTO">Emprendimiento</option>
                            ) : (
                                <>
                                    <option value="AVISO">Aviso</option>
                                    <option value="OBRA">Obra</option>
                                    <option value="COMUNICADO">Comunicado</option>
                                    <option value="EMPRENDIMIENTO">Emprendimiento</option>
                                </>
                            )}
                        </select>
                        <textarea
                            value={descripcion}
                            placeholder="Escribe una descripción para la publicación"
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={3}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                        />

                        {(imagenesVisibles.length > 0 || nuevasImagenesPreview.length > 0) && (
                            <div className="flex flex-wrap gap-3">
                                {imagenesVisibles.map(url => (
                                    <div key={url} className="relative">
                                        <img src={url} className="w-24 h-24 object-cover rounded-lg" />
                                        <Tooltip texto="Quitar" className="absolute -top-2 -right-2">
                                            <button
                                                type="button"
                                                onClick={() => setImagenesAEliminar([...imagenesAEliminar, url])}
                                                className="bg-white rounded-full shadow p-0.5 text-gray-600 hover:text-red-500 flex items-center justify-center"
                                                aria-label="Quitar"
                                            >
                                                <HiXMark size={14} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                ))}
                                {nuevasImagenesPreview.map((url, index) => (
                                    <div key={url} className="relative">
                                        <img src={url} className="w-24 h-24 object-cover rounded-lg border-2 border-volare-verde" />
                                        <Tooltip texto="Quitar" className="absolute -top-2 -right-2">
                                            <button
                                                type="button"
                                                onClick={() => quitarImagenNueva(index)}
                                                className="bg-white rounded-full shadow p-0.5 text-gray-600 hover:text-red-500 flex items-center justify-center"
                                                aria-label="Quitar"
                                            >
                                                <HiXMark size={14} />
                                            </button>
                                        </Tooltip>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(archivosVisibles.length > 0 || archivosNuevos.length > 0) && (
                            <div className="flex flex-col gap-2">
                                {archivosVisibles.map(url => (
                                    <ArchivoAdjunto
                                        key={url}
                                        nombre={obtenerNombreArchivo(url)}
                                        href={url}
                                        onQuitar={() => setArchivosAEliminar([...archivosAEliminar, url])}
                                    />
                                ))}
                                {archivosNuevos.map((archivo, index) => (
                                    <ArchivoAdjunto
                                        key={`${archivo.name}-${index}`}
                                        nombre={archivo.name}
                                        onQuitar={() => quitarArchivoNuevo(index)}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Tooltip texto="Subir imágenes">
                                <label className="cursor-pointer relative w-12 h-12 flex items-center justify-center bg-volare-azul text-white rounded-lg hover:opacity-90 transition">
                                    <HiOutlinePhoto size={22} />
                                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-volare-azul">
                                        <HiPlusSmall size={12} />
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => manejarNuevasImagenes(e.target.files)}
                                        className="hidden"
                                    />
                                </label>
                            </Tooltip>
                            <Tooltip texto="Subir documentos PDF">
                                <label className="cursor-pointer relative w-12 h-12 flex items-center justify-center bg-volare-morado text-white rounded-lg hover:opacity-90 transition">
                                    <HiOutlineDocumentText size={22} />
                                    <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 text-volare-morado">
                                        <HiPlusSmall size={12} />
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => setArchivosNuevos(Array.from(e.target.files))}
                                        className="hidden"
                                    />
                                </label>
                            </Tooltip>
                        </div>

                        <button
                            type="submit"
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Publicar
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    )
}

export default PostCard