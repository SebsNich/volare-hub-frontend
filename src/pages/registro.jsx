import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Registro() {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [manzana, setManzana] = useState('')
    const [villa, setVilla] = useState('')
    const { setUsuario } = useContext(AuthContext)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        
        const respuesta = await fetch('http://localhost:3000/api/auth/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password, manzana, villa })
        })
        const datos = await respuesta.json()
        console.log(datos)
        localStorage.setItem('token', datos.token)
        
        const respuestaPerfil = await fetch('http://localhost:3000/api/auth/perfil', {
            headers: {
                'Authorization': `Bearer ${datos.token}`
            }
        })
        const datosPerfil = await respuestaPerfil.json()
        setUsuario(datosPerfil.user)
        setEmail('')
        setPassword('')
        setManzana('')
        setVilla('')

        navigate('/')
    }

    return (
        <form onSubmit={handleSubmit}>
            <h1>Registro</h1>
            <input 
                type="text" 
                value={nombre} 
                placeholder='nombre'
                onChange={(e) => setNombre(e.target.value)} 
            />
            <input 
                type="email" 
                value={email} 
                placeholder='email'
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                value={password} 
                placeholder='contraseña'
                onChange={(e) => setPassword(e.target.value)} 
            />
            <input 
                type="text" 
                value={manzana}
                placeholder='manzana' 
                onChange={(e) => setManzana(e.target.value)} 
            />
            <input 
                type="text" 
                value={villa}
                placeholder='villa' 
                onChange={(e) => setVilla(e.target.value)} 
            />
            <button type='submit'>Registrar</button>
        </form>
    )
}

export default Registro