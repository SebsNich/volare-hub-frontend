import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import CampoContrasena from './CampoContrasena'
import { API_URL } from '../config/api'
import { esCedulaValida } from '../utilities/helpers'

function ModalAuth({ onClose }) {
    const [modo, setModo] = useState('login')
    const { setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [nombres, setNombres] = useState('')
    const [apellidos, setApellidos] = useState('')
    const [cedula, setCedula] = useState('')
    const [celular, setCelular] = useState('')
    const [emailRegistro, setEmailRegistro] = useState('')
    const [passwordRegistro, setPasswordRegistro] = useState('')
    const [confirmarPasswordRegistro, setConfirmarPasswordRegistro] = useState('')
    const [manzana, setManzana] = useState('')
    const [villa, setVilla] = useState('')

    const [correoRecuperar, setCorreoRecuperar] = useState('')
    const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false)

    const [error, setError] = useState('')

    const esLogin = modo === 'login'
    const esRegistro = modo === 'registro'
    const esRecuperar = modo === 'recuperar'

    async function iniciarSesionConToken(token, mensajeExito) {
        localStorage.setItem('token', token)
        const respuestaPerfil = await fetch(`${API_URL}/api/auth/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })

        if (!respuestaPerfil.ok) {
            mostrarToast('No se pudo cargar tu perfil', 'error')
            return
        }

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

        if (passwordRegistro !== confirmarPasswordRegistro) {
            setError('Las contraseñas no coinciden')
            mostrarToast('Las contraseñas no coinciden', 'error')
            return
        }

        if (!esCedulaValida(cedula)) {
            setError('La cédula debe tener 10 dígitos')
            mostrarToast('La cédula debe tener 10 dígitos', 'error')
            return
        }

        const respuesta = await fetch(`${API_URL}/api/auth/registrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombres, apellidos, cedula, celular, email: emailRegistro, password: passwordRegistro, manzana, villa })
        })
        const datos = await respuesta.json()

        if (!respuesta.ok) {
            setError(datos.mensaje || 'No se pudo completar el registro')
            mostrarToast(datos.mensaje || 'No se pudo completar el registro', 'error')
            return
        }

        await iniciarSesionConToken(datos.token, 'Cuenta creada correctamente')
    }

    async function handleSolicitarRecuperacion(e) {
        e.preventDefault()
        setEnviandoRecuperacion(true)

        try {
            await fetch(`${API_URL}/api/auth/solicitar-recuperacion`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: correoRecuperar })
            })
        } catch {
            // ignorado: el mensaje mostrado al usuario es siempre el mismo
        } finally {
            mostrarToast('Si el correo existe, te enviamos instrucciones para restablecer tu contraseña', 'exito')
            setCorreoRecuperar('')
            setEnviandoRecuperacion(false)
            setTimeout(() => setModo('login'), 2500)
        }
    }

    return (
        <Modal onClose={onClose}>
            <div
                key={modo}
                className={esLogin ? 'flex flex-col gap-4 animate-volare-barrido-izquierda' : 'flex flex-col gap-4 animate-volare-barrido-derecha'}
            >
            {esLogin && (
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
                        <CampoContrasena
                            value={password}
                            placeholder="Contraseña"
                            onChange={(e) => setPassword(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        <button
                            type="submit"
                            className="bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Iniciar sesión
                        </button>
                    </form>
                    <p className="text-sm text-center">
                        <button
                            type="button"
                            onClick={() => { setModo('recuperar'); setError('') }}
                            className="text-volare-azul text-sm hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </p>
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
            )}
            {esRegistro && (
                <>
                    <h2 className="text-2xl font-bold text-volare-verde text-center mb-2">Registro de Residentes</h2>
                    <form onSubmit={handleRegistro} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={nombres}
                                placeholder="Nombres"
                                required
                                onChange={(e) => setNombres(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                            <input
                                type="text"
                                value={apellidos}
                                placeholder="Apellidos"
                                required
                                onChange={(e) => setApellidos(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={cedula}
                                placeholder="Cédula"
                                inputMode="numeric"
                                maxLength={10}
                                required
                                onChange={(e) => setCedula(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                            <input
                                type="text"
                                value={celular}
                                placeholder="Celular"
                                required
                                onChange={(e) => setCelular(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={manzana}
                                placeholder="Manzana"
                                required
                                onChange={(e) => setManzana(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                            <input
                                type="text"
                                value={villa}
                                placeholder="Villa"
                                required
                                onChange={(e) => setVilla(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                            />
                        </div>
                        <input
                            type="email"
                            value={emailRegistro}
                            placeholder="Email"
                            required
                            onChange={(e) => setEmailRegistro(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <CampoContrasena
                            value={passwordRegistro}
                            placeholder="Contraseña"
                            required
                            onChange={(e) => setPasswordRegistro(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <CampoContrasena
                            value={confirmarPasswordRegistro}
                            placeholder="Confirmar Contraseña"
                            required
                            onChange={(e) => setConfirmarPasswordRegistro(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
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
            {esRecuperar && (
                <>
                    <h2 className="text-2xl font-bold text-volare-azul text-center mb-2">Recuperar Contraseña</h2>
                    <form onSubmit={handleSolicitarRecuperacion} className="flex flex-col gap-4">
                        <input
                            type="email"
                            value={correoRecuperar}
                            placeholder="Correo"
                            required
                            onChange={(e) => setCorreoRecuperar(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <button
                            type="submit"
                            disabled={enviandoRecuperacion}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                enviandoRecuperacion
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-volare-azul text-white hover:opacity-90 cursor-pointer'
                            }`}
                        >
                            {enviandoRecuperacion ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>
                    </form>
                    <p className="text-sm text-gray-600 text-center">
                        <button
                            type="button"
                            onClick={() => { setModo('login'); setError('') }}
                            className="text-volare-azul font-semibold hover:underline"
                        >
                            ‹ Volver a Iniciar Sesión
                        </button>
                    </p>
                </>
            )}
            </div>
        </Modal>
    )
}

export default ModalAuth
