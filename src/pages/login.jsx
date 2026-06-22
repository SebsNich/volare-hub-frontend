import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setUsuario } = useContext(AuthContext)

    async function handleSubmit(e) {
        e.preventDefault()
        
        const respuesta = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        const datos = await respuesta.json()
        localStorage.setItem('token', datos.token)
        
        const respuestaPerfil = await fetch('http://localhost:3000/api/auth/perfil', {
            headers: {
                'Authorization': `Bearer ${datos.token}`
            }
        })
        const datosPerfil = await respuestaPerfil.json()
        setUsuario(datosPerfil.user)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type="submit">Iniciar sesión</button>
        </form>
    )
}
export default Login