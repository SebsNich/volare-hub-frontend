import { Link } from "react-router-dom"
import { useState } from "react"
import Modal from './Modal'

function PostCard({ post, usuario, eliminar, onEditar    }) {
    const puedeEditar = usuario && (usuario.id === post.autorId || usuario.rol === 'ADMIN')
    const [modalAbierto, setModalAbierto] = useState(false)
    const [titulo, setTitulo] = useState(post.titulo)
    const [descripcion, setDescripcion] = useState(post.descripcion)
    const [tipo, setTipo] = useState(post.tipo)
    const [imagenesAEliminar, setImagenesAEliminar] = useState([])
    const [imagenesNuevas, setImagenesNuevas] = useState([])
    const [archivosAEliminar, setArchivosAEliminar] = useState([])
    const [archivosNuevos, setArchivosNuevos] = useState([])

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
        
        const respuesta = await fetch(`http://localhost:3000/api/posts/${post.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        
        if (respuesta.ok) {
            setModalAbierto(false)
            onEditar()
        }
    }

    return (
        <div>
            <Link to={`/perfil/${post.autorId}`}>{post.autor.nombre}</Link>
            <h2>{post.titulo}</h2>
            <p>{post.tipo}</p>
            <p>{post.descripcion}</p>
            <p>{new Date(post.creadoEn).toLocaleDateString()}</p>
            {post.imagenUrl.length > 0 && <img src={post.imagenUrl[0]} />}
            {post.archivoUrl.length > 0 && <a href={post.archivoUrl[0]}>Descargar PDF</a>}
            <div>
                {puedeEditar && (
                    <>
                        <button onClick={() => setModalAbierto(true)}>Editar</button>
                        <button onClick={() => eliminar(post.id)}>Eliminar</button>
                    </>
                )}
            </div>
            {modalAbierto && (
                <Modal onClose={() => setModalAbierto(false)}>
                    <form onSubmit={handleSubmit}>
                        <input 
                            type="text" 
                            value={titulo} 
                            onChange={(e) => setTitulo(e.target.value)} 
                        />
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option value="">Seleccione un tipo</option>
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
                        <input 
                            type="text" 
                            value={descripcion} 
                            onChange={(e) => setDescripcion(e.target.value)} 
                        />
                        {imagenesVisibles.map(url => (
                            <div key={url}>
                                <img src={url} style={{ width: '100px' }} />
                                <button 
                                    type="button" 
                                    onClick={() => setImagenesAEliminar([...imagenesAEliminar, url])}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}
                        {archivosVisibles.map(url => (
                            <div key={url}>
                                <a href={url}>Ver PDF</a>
                                <button 
                                    type="button" 
                                    onClick={() => setArchivosAEliminar([...archivosAEliminar, url])}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}
                        <input 
                            type="file" 
                            multiple 
                            onChange={(e) => setImagenesNuevas(Array.from(e.target.files))} 
                        />
                        <input 
                            type="file" 
                            multiple 
                            onChange={(e) => setArchivosNuevos(Array.from(e.target.files))} 
                        />
                        <button type="submit">Publicar</button>
                    </form>
                </Modal>
            )}
        </div>
    )
}

export default PostCard