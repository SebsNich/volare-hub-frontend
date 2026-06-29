import { Link } from "react-router-dom"
import { useState } from "react"
import Modal from './Modal'

function PostCard({ post, usuario, eliminar, onEditar    }) {
    const puedeEditar = usuario && (usuario.id === post.autorId || usuario.rol === 'ADMIN')
    const [modalAbierto, setModalAbierto] = useState(false)
    const [titulo, setTitulo] = useState(post.titulo)
    const [descripcion, setDescripcion] = useState(post.descripcion)
    const [tipo, setTipo] = useState(post.tipo)

    async function handleSubmit(e) {
        e.preventDefault()
        
        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descripcion', descripcion)
        formData.append('tipo', tipo)
        
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
                        <button type="submit">Publicar</button>
                    </form>
                </Modal>
            )}
        </div>
    )
}

export default PostCard