import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import ArchivoAdjunto from './ArchivoAdjunto'
import Tooltip from './Tooltip'
import { HiOutlineMapPin, HiMapPin, HiOutlinePhoto, HiOutlineDocumentText, HiPlusSmall, HiXMark } from 'react-icons/hi2'

function FormularioPost({ origen = 'feed', onPublicado, enModal = false }) {
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [tipo, setTipo] = useState('')
    const [imagenes, setImagenes] = useState([])
    const [imagenesPreview, setImagenesPreview] = useState([])
    const [archivos, setArchivos] = useState([])
    const [anclado, setAnclado] = useState(false)
    const [ancladoPerfil, setAncladoPerfil] = useState(false)

    const mostrarAnclarFeed = usuario.rol === 'ADMIN'
    const mostrarAnclarPerfil = origen === 'perfil'

    function manejarImagenes(archivosSeleccionados) {
        const lista = Array.from(archivosSeleccionados)
        setImagenes(lista)
        setImagenesPreview(lista.map(archivo => URL.createObjectURL(archivo)))
    }

    function quitarImagen(index) {
        URL.revokeObjectURL(imagenesPreview[index])
        setImagenes(imagenes.filter((_, i) => i !== index))
        setImagenesPreview(imagenesPreview.filter((_, i) => i !== index))
    }

    function quitarArchivo(index) {
        setArchivos(archivos.filter((_, i) => i !== index))
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descripcion', descripcion)
        formData.append('tipo', tipo)
        formData.append('anclado', anclado)
        formData.append('ancladoPerfil', ancladoPerfil)
        imagenes.forEach(imagen => {
            formData.append('imagenes', imagen)
        })
        archivos.forEach(archivo => {
            formData.append('archivos', archivo)
        })

        const respuesta = await fetch('http://localhost:3000/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        if (respuesta.ok) {
            setTitulo('')
            setTipo('')
            setDescripcion('')
            setImagenes([])
            setImagenesPreview([])
            setArchivos([])
            setAnclado(false)
            setAncladoPerfil(false)
            mostrarToast('Publicación creada correctamente', 'exito')
            onPublicado?.()
        } else {
            const datos = await respuesta.json()
            mostrarToast(datos.error || 'No se pudo crear la publicación', 'error')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={enModal ? 'flex flex-col gap-4' : 'bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4'}
        >
            <h2 className="text-xl font-semibold text-volare-azul mb-4">¿Qué deseas publicar hoy?</h2>
            <input
                type="text"
                value={titulo}
                placeholder="Título"
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
                placeholder="Descripción"
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
            />
            {imagenesPreview.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {imagenesPreview.map((url, index) => (
                        <div key={url} className="relative">
                            <img src={url} className="w-24 h-24 object-cover rounded-lg" />
                            <Tooltip texto="Quitar" className="absolute -top-2 -right-2">
                                <button
                                    type="button"
                                    onClick={() => quitarImagen(index)}
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

            {archivos.length > 0 && (
                <div className="flex flex-col gap-2">
                    {archivos.map((archivo, index) => (
                        <ArchivoAdjunto
                            key={`${archivo.name}-${index}`}
                            nombre={archivo.name}
                            onQuitar={() => quitarArchivo(index)}
                        />
                    ))}
                </div>
            )}

            {(mostrarAnclarFeed || mostrarAnclarPerfil) && (
                <div className="flex gap-3">
                    {mostrarAnclarFeed && (
                        <Tooltip texto="Anclar en el feed general">
                            <button
                                type="button"
                                onClick={() => setAnclado(!anclado)}
                                className={`hover:opacity-70 transition-opacity ${anclado ? 'text-volare-azul' : 'text-gray-400'}`}
                                aria-label="Anclar en el feed general"
                            >
                                {anclado ? <HiMapPin size={22} /> : <HiOutlineMapPin size={22} />}
                            </button>
                        </Tooltip>
                    )}
                    {mostrarAnclarPerfil && (
                        <Tooltip texto="Anclar en mi perfil">
                            <button
                                type="button"
                                onClick={() => setAncladoPerfil(!ancladoPerfil)}
                                className={`hover:opacity-70 transition-opacity ${ancladoPerfil ? 'text-volare-azul' : 'text-gray-400'}`}
                                aria-label="Anclar en mi perfil"
                            >
                                {ancladoPerfil ? <HiMapPin size={22} /> : <HiOutlineMapPin size={22} />}
                            </button>
                        </Tooltip>
                    )}
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
                            onChange={(e) => manejarImagenes(e.target.files)}
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
                            onChange={(e) => setArchivos(Array.from(e.target.files))}
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
    )
}

export default FormularioPost
