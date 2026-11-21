import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Modal from './Modal'
import CampoContrasena from './CampoContrasena'
import AvisoContrasena from './AvisoContrasena'
import { validarContrasena } from '../utilities/contrasena'
import { API_URL } from '../config/api'
import { esCedulaValida } from '../utilities/helpers'
import { modoInicialAuth } from '../utilities/landing'

// Qué campos del registro se marcan en rojo según el código de error del backend.
// El texto del error lo da el backend; aquí solo se señala dónde corregir.
const CAMPOS_POR_CODIGO = {
    LIMITE_VILLA: ['manzana', 'villa'],
    EMAIL_DUPLICADO: ['email'],
    CEDULA_DUPLICADA: ['cedula']
}
// En el login, estos errores se quedan dentro del modal (sin toast) porque
// pueden traer un motivo largo que el usuario necesita leer con calma.
const CODIGOS_LOGIN_EN_MODAL = ['CUENTA_RECHAZADA', 'CUENTA_INACTIVA']
const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.'
const DURACION_AVISO_LARGO_MS = 8000

const CLASE_CAMPO_REGISTRO = 'border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde'

// modoInicial: 'registro' para "Soy propietario: registrarme" (RF-03); por defecto, inicio de sesión.
function ModalAuth({ onClose, modoInicial }) {
    const [modo, setModo] = useState(() => modoInicialAuth(modoInicial))
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
    const [codigoError, setCodigoError] = useState(null)
    const [enviandoRegistro, setEnviandoRegistro] = useState(false)

    const esLogin = modo === 'login'
    const esRegistro = modo === 'registro'
    const esRecuperar = modo === 'recuperar'

    function cambiarModo(nuevoModo) {
        setModo(nuevoModo)
        setError('')
        setCodigoError(null)
    }

    function claseCampoRegistro(campo) {
        const conError = CAMPOS_POR_CODIGO[codigoError]?.includes(campo)
        return `${CLASE_CAMPO_REGISTRO} ${conError ? 'border-red-500' : 'border-gray-300'}`
    }

    function irAlLoginConEmail() {
        setEmail(emailRegistro)
        cambiarModo('login')
    }

    async function iniciarSesionConToken(token, mensajeExito, duracion) {
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
        mostrarToast(mensajeExito, 'exito', duracion)
        navigate('/feed')
        onClose()
    }

    async function handleLogin(e) {
        e.preventDefault()
        setError('')

        let respuesta
        try {
            respuesta = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
        } catch {
            setError(MENSAJE_SIN_CONEXION)
            return
        }
        const datos = await respuesta.json().catch(() => ({}))

        if (!respuesta.ok) {
            const mensaje = datos.mensaje || 'No se pudo iniciar sesión'
            setError(mensaje)
            if (!CODIGOS_LOGIN_EN_MODAL.includes(datos.codigo)) mostrarToast(mensaje, 'error')
            return
        }

        if (datos.codigo === 'CUENTA_PENDIENTE') {
            await iniciarSesionConToken(datos.token, datos.mensaje, DURACION_AVISO_LARGO_MS)
        } else {
            await iniciarSesionConToken(datos.token, 'Bienvenido de nuevo')
        }
    }

    async function handleRegistro(e) {
        e.preventDefault()
        setError('')
        setCodigoError(null)

        const errorContrasena = validarContrasena(passwordRegistro)
        if (errorContrasena) {
            setError(errorContrasena)
            mostrarToast(errorContrasena, 'error')
            return
        }

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

        // Se desactiva el botón mientras tanto: un doble clic enviaría dos registros.
        setEnviandoRegistro(true)
        let respuesta
        try {
            respuesta = await fetch(`${API_URL}/api/auth/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombres, apellidos, cedula, celular, email: emailRegistro, password: passwordRegistro, manzana, villa })
            })
        } catch {
            setError(MENSAJE_SIN_CONEXION)
            setEnviandoRegistro(false)
            return
        }
        const datos = await respuesta.json().catch(() => ({}))

        if (!respuesta.ok) {
            const mensaje = datos.mensaje || 'No se pudo completar el registro'
            setError(mensaje)
            setCodigoError(datos.codigo || null)
            mostrarToast(mensaje, 'error')
            setEnviandoRegistro(false)
            return
        }

        await iniciarSesionConToken(
            datos.token,
            'Cuenta creada. Un administrador debe aprobarla; mientras tanto puedes ver las publicaciones.',
            DURACION_AVISO_LARGO_MS
        )
        setEnviandoRegistro(false)
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
                            onClick={() => cambiarModo('recuperar')}
                            className="text-volare-azul text-sm hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => cambiarModo('registro')}
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
                                className={claseCampoRegistro('cedula')}
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
                                inputMode="numeric"
                                maxLength={2}
                                value={manzana}
                                placeholder="Manzana (ej. 07)"
                                required
                                // Solo números del 1 al 99: así no hay "A" ni "2" frente a "02".
                                onChange={(e) => setManzana(e.target.value.replace(/\D/g, ''))}
                                className={claseCampoRegistro('manzana')}
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={villa}
                                placeholder="Villa (ej. 03)"
                                required
                                // Solo números del 1 al 99: así no hay "A" ni "2" frente a "02".
                                onChange={(e) => setVilla(e.target.value.replace(/\D/g, ''))}
                                className={claseCampoRegistro('villa')}
                            />
                        </div>
                        <p className="text-xs text-gray-500 -mt-2">Puedes escribir 7 o 07; lo guardamos como 07.</p>
                        <input
                            type="email"
                            value={emailRegistro}
                            placeholder="Email"
                            required
                            onChange={(e) => setEmailRegistro(e.target.value)}
                            className={claseCampoRegistro('email')}
                        />
                        <CampoContrasena
                            value={passwordRegistro}
                            placeholder="Contraseña"
                            required
                            onChange={(e) => setPasswordRegistro(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        <div className="-mt-2"><AvisoContrasena password={passwordRegistro} /></div>
                        <CampoContrasena
                            value={confirmarPasswordRegistro}
                            placeholder="Confirmar Contraseña"
                            required
                            onChange={(e) => setConfirmarPasswordRegistro(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-verde"
                        />
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {codigoError === 'EMAIL_DUPLICADO' && (
                            <p className="text-sm text-gray-600 text-center -mt-2">
                                ¿Ya tienes cuenta?{' '}
                                <button type="button" onClick={irAlLoginConEmail} className="text-volare-azul font-semibold hover:underline">
                                    Inicia sesión con este email
                                </button>
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={enviandoRegistro}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                enviandoRegistro
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-volare-verde text-white hover:opacity-90'
                            }`}
                        >
                            {enviandoRegistro ? 'Registrando...' : 'Registrar'}
                        </button>
                    </form>
                    <p className="text-sm text-gray-600 text-center">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => cambiarModo('login')}
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
                            onClick={() => cambiarModo('login')}
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
