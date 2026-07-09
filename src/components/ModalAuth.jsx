import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import { API_URL } from '../config/api'

function ModalAuth({ onClose }) {
    const [modo, setModo] = useState('login')
    const { setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [nombre, setNombre] = useState('')
    const [emailRegistro, setEmailRegistro] = useState('')
    const [passwordRegistro, setPasswordRegistro] = useState('')
    const [manzana, setManzana] = useState('')
    const [villa, setVilla] = useState('')

    const [error, setError] = useState('')

    const esLogin = modo === 'login'

    async function iniciarSesionConToken(token, mensajeExito) {
        localStorage.setItem('token', token)
        const respuestaPerfil = await fetch(`${API_URL}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        const datosPerfil = await respuestaPerfil.json()
        setUsuario(datosPerfil.user)
        mostrarToast(mensajeExito, 'exito')
        navigate('/')
        onClose()
    }

    async function handleLogin(e) {
        e.preventDefault()
        setError('')

        const respuesta = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            setError(datos.mensaje || 'No se pudo iniciar sesión')
            mostrarToast(datos.mensaje || 'No se pudo iniciar sesión', 'error')
            return
        }

        await iniciarSesionConToken(datos.token, 'Bienvenido de nuevo')
    }

    async function handleRegistro(e) {
        e.preventDefault()
        setError('')

        const respuesta = await fetch(`${API_URL}/api/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email: emailRegistro, password: passwordRegistro, manzana, villa })
        })
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            setError(datos.mensaje || 'No se pudo completar el registro')
            mostrarToast(datos.mensaje || 'No se pudo completar el registro', 'error')
            return
        }

        await iniciarSesionConToken(datos.token, 'Cuenta creada correctamente')
    }

    return (
        <Modal onClose={onClose}>
            <div
                key={modo}
                className={esLogin ? 'flex flex-col gap-4 animate-volare-barrido-izquierda' : 'flex flex-col gap-4 animate-volare-barrido-derecha'}
            >
            {esLogin ? (
                <>
                    <h2 className="text-2xl font-bold text-volare-azul text-center mb-2">Inicio de Sesión</h2>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <button
                            type="submit"
                            className="bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Iniciar sesión
                        </button>
                    </form>
                    <p className="text-sm text-gray-600 text-center">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => { setModo('registro'); setError('') }}
                            className="text-volare-verde font-semibold hover:underline"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                </>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-volare-verde text-center mb-2">Registro de Residentes</h2>
                    <form onSubmit={handleRegistro} className="flex flex-col gap-4">
                        <input
                            type="text"
                            value={nombre}
                            placeholder="Nombre"
                            onChange={(e) => setNombre(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <input
                            type="email"
                            value={emailRegistro}
                            placeholder="Email"
                            onChange={(e) => setEmailRegistro(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <input
                            type="password"
                            value={passwordRegistro}
                            placeholder="Contraseña"
                            onChange={(e) => setPasswordRegistro(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <input
                            type="text"
                            value={manzana}
                            placeholder="Manzana"
                            onChange={(e) => setManzana(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <input
                            type="text"
                            value={villa}
                            placeholder="Villa"
                            onChange={(e) => setVilla(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <button
                            type="submit"
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Registrar
                        </button>
                    </form>
                    <p className="text-sm text-gray-600 text-center">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => { setModo('login'); setError('') }}
                            className="text-volare-azul font-semibold hover:underline"
                        >
                            Inicia sesión aquí
                        </button>
                    </p>
                </>
            )}
            </div>
        </Modal>
    )
}

export default ModalAuth
