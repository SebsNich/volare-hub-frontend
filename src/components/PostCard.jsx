function PostCard({ post }) {
    return (
        <div>
            <h2>{post.titulo}</h2>
            <p>{post.tipo}</p>
            <p>{post.descripcion}</p>
            {post.imagenUrl.length > 0 && <img src={post.imagenUrl[0]} />}
            {post.archivoUrl.length > 0 && <a href={post.archivoUrl[0]}>Descargar PDF</a>}
        </div>
    )
}

export default PostCard