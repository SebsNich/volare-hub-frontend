import { Link } from "react-router-dom"

function PostCard({ post, usuario, eliminar   }) {
    const puedeEditar = usuario && (usuario.id === post.autorId || usuario.rol === 'ADMIN')
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
                        <button onClick={() => console.log('editar')}>Editar</button>
                        <button onClick={() => eliminar(post.id)}>Eliminar</button>
                    </>
                )}
            </div>
        </div>
    )
}

export default PostCard