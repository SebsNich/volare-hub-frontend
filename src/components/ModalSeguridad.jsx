import { useState, useContext } from 'react'
import { HiOutlineShieldCheck, HiOutlineKey, HiOutlineEnvelope, HiOutlineInformationCircle } from 'react-icons/hi2'
import Modal from './Modal'
import CampoClave from './CampoClave'
import MedidorClave from './MedidorClave'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { validarContrasena } from '../utilities/contrasena'
import { enmascararEmail } from '../utilities/credenciales'

const CLASE_INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-volare-azul'

// Las credenciales (correo y contraseña) son lo que protege la cuenta, por eso
// van en su propia ventana: cada cambio pide la contraseña actual, avisa por
// correo y los errores se muestran junto al formulario, no solo en un toast.
function ModalSeguridad({ onClose }) {
    const { usuario, setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [pestana, setPestana] = useState('password')

    return (
        <Modal onClose={onClose} ancho="max-w-lg">
            <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl bg-volare-verde/10 text-volare-verde flex items-center justify-center">
                    <HiOutlineShieldCheck size={26} />
                </span>
                <div>
                    <h3 className="text-lg font-bold text-volare-azul leading-tight">Seguridad de la cuenta</h3>
                    <p className="text-sm text-gray-500">Protege el acceso a tu cuenta de Volare</p>
                </div>
            </div>

            <div role="tablist" className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
                {[['password', 'Contraseña', HiOutlineKey], ['email', 'Correo de acceso', HiOutlineEnvelope]].map(([id, texto, Icono]) => (
                    <button
                        key={id}
                        role="tab"
                        type="button"
                        aria-selected={pestana === id}
                        onClick={() => setPestana(id)}
                        className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition ${pestana === id ? 'bg-white text-volare-azul shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Icono size={16} /> {texto}
                    </button>
                ))}
            </div>

            {pestana === 'password'
                ? <FormularioPassword mostrarToast={mostrarToast} />
                : <FormularioEmail usuario={usuario} setUsuario={setUsuario} mostrarToast={mostrarToast} />}

            <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
                <HiOutlineInformationCircle size={18} className="shrink-0 mt-0.5" />
                <p>Cada cambio te llega por correo como aviso. Si no fuiste tú, restablece tu contraseña desde "¿Olvidaste tu contraseña?" y avisa a la administración. Volare nunca te pedirá tu contraseña por mensaje.</p>
            </div>
        </Modal>
    )
}

async function enviarCambio(ruta, cuerpo) {
    const respuesta = await fetch(`${API_URL}/api/auth/${ruta}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(cuerpo)
    })
    const datos = await respuesta.json().catch(() => ({}))
    return { ok: respuesta.ok, datos }
}

function FormularioPassword({ mostrarToast }) {
    const [actual, setActual] = useState('')
    const [nueva, setNueva] = useState('')
    const [confirmar, setConfirmar] = useState('')
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)

    async function enviar(e) {
        e.preventDefault()
        const nuevos = {}
        if (!actual) nuevos.actual = 'Escribe tu contraseña actual.'
        const errorNueva = validarContrasena(nueva)
        if (errorNueva) nuevos.nueva = errorNueva
        else if (nueva === actual) nuevos.nueva = 'La contraseña nueva debe ser distinta de la actual.'
        if (!nuevos.nueva && nueva !== confirmar) nuevos.confirmar = 'Las contraseñas no coinciden.'
        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        setEnviando(true)
        const { ok, datos } = await enviarCambio('cambiar-password', { passwordActual: actual, passwordNuevo: nueva })
        setEnviando(false)
        if (ok) {
            setActual(''); setNueva(''); setConfirmar('')
            mostrarToast('Contraseña actualizada. Te enviamos un aviso por correo.', 'exito')
        } else {
            setErrores({ general: datos.mensaje || 'No se pudo actualizar la contraseña' })
        }
    }

    return (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
            <CampoClave id="pw-actual" etiqueta="Contraseña actual" value={actual} onChange={setActual} autoComplete="current-password" error={errores.actual} />
            <div className="border-t border-gray-100" />
            <CampoClave id="pw-nueva" etiqueta="Contraseña nueva" value={nueva} onChange={setNueva} autoComplete="new-password" error={errores.nueva} />
            <MedidorClave password={nueva} />
            <CampoClave id="pw-confirmar" etiqueta="Repite la contraseña nueva" value={confirmar} onChange={setConfirmar} autoComplete="new-password" error={errores.confirmar} />
            {errores.general && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{errores.general}</p>}
            <button type="submit" disabled={enviando} className="bg-volare-verde text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60">
                {enviando ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
        </form>
    )
}

function FormularioEmail({ usuario, setUsuario, mostrarToast }) {
    const [nuevo, setNuevo] = useState('')
    const [clave, setClave] = useState('')
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)

    async function enviar(e) {
        e.preventDefault()
        const nuevos = {}
        const correo = nuevo.trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) nuevos.nuevo = 'Escribe un correo válido (ejemplo: nombre@correo.com).'
        else if (correo.toLowerCase() === usuario?.email?.toLowerCase()) nuevos.nuevo = 'Ese ya es tu correo actual.'
        if (!clave) nuevos.clave = 'Confirma con tu contraseña actual.'
        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        setEnviando(true)
        const { ok, datos } = await enviarCambio('cambiar-email', { emailNuevo: correo, passwordActual: clave })
        setEnviando(false)
        if (ok) {
            setUsuario(datos.user)
            setNuevo(''); setClave('')
            mostrarToast('Correo actualizado. Úsalo desde ahora para iniciar sesión.', 'exito')
        } else {
            setErrores({ general: datos.mensaje || 'No se pudo actualizar el correo' })
        }
    }

    return (
        <form onSubmit={enviar} className="flex flex-col gap-4" noValidate>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                <p className="text-xs text-gray-500">Correo de acceso actual</p>
                <p className="text-sm font-semibold text-gray-800">{enmascararEmail(usuario?.email) || '—'}</p>
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="email-nuevo" className="text-sm font-semibold text-gray-700">Correo nuevo</label>
                <input id="email-nuevo" type="email" value={nuevo} onChange={(e) => setNuevo(e.target.value)} autoComplete="email" placeholder="nombre@correo.com" aria-invalid={errores.nuevo ? 'true' : undefined} className={CLASE_INPUT} />
                {errores.nuevo && <p className="text-xs text-red-600" role="alert">{errores.nuevo}</p>}
                <p className="text-xs text-gray-500">Es el correo con el que inicias sesión y donde recibes los avisos.</p>
            </div>
            <CampoClave id="email-clave" etiqueta="Contraseña actual" value={clave} onChange={setClave} autoComplete="current-password" ayuda="La pedimos para confirmar que eres tú." error={errores.clave} />
            {errores.general && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{errores.general}</p>}
            <button type="submit" disabled={enviando} className="bg-volare-azul text-white px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60">
                {enviando ? 'Guardando…' : 'Actualizar correo'}
            </button>
        </form>
    )
}

export default ModalSeguridad
