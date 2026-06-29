import { useState, useEffect, useContext  } from 'react'
import PostCard from '../components/PostCard'
import { AuthContext } from '../context/AuthContext'

function Feed() {
    const [posts, setPosts] = useState([])
    const [titulo, setTitulo] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [tipo, setTipo] = useState('')
    const [imagenes, setImagenes] = useState([])
    const [archivos, setArchivos] = useState([])
    const { usuario } = useContext(AuthContext)

    async function cargarPosts(){
        const respuesta = await fetch('http://localhost:3000/api/posts')
        const datos = await respuesta.json()
        setPosts(datos)
    }
    
    async function eliminarPost(id) {
        const confirmado = confirm('¿Estás seguro de eliminar este post?')
        
        if (confirmado) {
            const respuesta = await fetch(`http://localhost:3000/api/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            
            if (respuesta.ok) {
                cargarPosts()
            }
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarPosts()
}, [])

    async function handleSubmit(e) {
        e.preventDefault()
        
        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descripcion', descripcion)
        formData.append('tipo', tipo)
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
            cargarPosts()
            setTitulo('')
            setTipo('')
            setDescripcion('')
            setImagenes([])
            setArchivos([])
        } else {
            const datos = await respuesta.json()
            console.error('Error al crear post:', datos)
        }
    }

    return (
        <div>
            {usuario && (
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
                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => setImagenes(Array.from(e.target.files))} 
                    />
                    <input 
                        type="file" 
                        multiple 
                        onChange={(e) => setArchivos(Array.from(e.target.files))} 
                    />
                    <button type="submit">Publicar</button>
                </form>
            )}
            {posts.map(post => <PostCard key={post.id} post={post} usuario={usuario} eliminar={eliminarPost}/>)}
        </div>
    )
}

export default Feed