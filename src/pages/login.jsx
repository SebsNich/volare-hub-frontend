import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config/api'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        const respuesta = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            mostrarToast(datos.mensaje || 'No se pudo iniciar sesión', 'error')
            return
        }

        localStorage.setItem('token', datos.token)

        const respuestaPerfil = await fetch(`${API_URL}/api/auth/perfil`, {
            headers: {
                'Authorization': `Bearer ${datos.token}`
            }
        })

        if (!respuestaPerfil.ok) {
            mostrarToast('Sesión iniciada, pero no se pudo cargar tu perfil', 'error')
            return
        }

        const datosPerfil = await respuestaPerfil.json()
        setUsuario(datosPerfil.user)
        setEmail('')
        setPassword('')
        mostrarToast('Bienvenido de nuevo', 'exito')

        navigate('/')
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4 border border-gray-100"
            >
                <h1 className="text-2xl font-bold text-volare-azul text-center mb-2">Iniciar sesión</h1>
                <input
                    type="email"
                    value={email}
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                />
                <input
                    type="password"
                    value={password}
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                />
                <button
                    type="submit"
                    className="bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition mt-2"
                >
                    Iniciar sesión
                </button>
            </form>
        </div>
    )
}
export default Login