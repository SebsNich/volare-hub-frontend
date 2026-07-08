import { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

function Registro() {
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [manzana, setManzana] = useState('')
    const [villa, setVilla] = useState('')
    const { setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
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

        if (!respuesta.ok) {
            mostrarToast(datos.mensaje || 'No se pudo completar el registro', 'error')
            return
        }

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
        mostrarToast('Cuenta creada correctamente', 'exito')

        navigate('/')
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm flex flex-col gap-4 border border-gray-100"
            >
                <h1 className="text-2xl font-bold text-volare-azul text-center mb-2">Registro</h1>
                <input
                    type="text"
                    value={nombre}
                    placeholder="Nombre"
                    onChange={(e) => setNombre(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                />
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
                <input
                    type="text"
                    value={manzana}
                    placeholder="Manzana"
                    onChange={(e) => setManzana(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                />
                <input
                    type="text"
                    value={villa}
                    placeholder="Villa"
                    onChange={(e) => setVilla(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                />
                <button
                    type="submit"
                    className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition mt-2"
                >
                    Registrar
                </button>
            </form>
        </div>
    )
}

export default Registro