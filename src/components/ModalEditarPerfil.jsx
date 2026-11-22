import { useState, useContext } from 'react'
import { HiOutlineCamera, HiOutlineTrash, HiOutlineLockClosed, HiOutlineDevicePhoneMobile } from 'react-icons/hi2'
import Modal from './Modal'
import AvatarUsuario from './AvatarUsuario'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { textoUbicacion } from '../utilities/perfil'
import { MAXIMO_BIO, MENSAJE_CELULAR, enmascararCedula, enmascararEmail, normalizarCelular } from '../utilities/credenciales'

const CLASE_INPUT = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-volare-azul'

function Seccion({ titulo, children }) {
    return (
        <section className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-gray-400">{titulo}</h4>
            {children}
        </section>
    )
}

// Datos que el residente no puede cambiar: se ven (la cédula enmascarada) con un
// candado para que quede claro que no es un campo olvidado sino una decisión.
function DatoProtegido({ etiqueta, valor }) {
    return (
        <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
            <div className="min-w-0">
                <p className="text-xs text-gray-500">{etiqueta}</p>
                <p className="text-sm font-semibold text-gray-800 truncate">{valor || '—'}</p>
            </div>
            <HiOutlineLockClosed size={16} className="text-gray-400 shrink-0" aria-label="No editable" />
        </div>
    )
}

function ModalEditarPerfil({ usuario, onClose, onGuardado }) {
    const { usuario: yo, setUsuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [nombres, setNombres] = useState(usuario.nombres || '')
    const [apellidos, setApellidos] = useState(usuario.apellidos || '')
    const [bio, setBio] = useState(usuario.bio || '')
    const [celular, setCelular] = useState(yo?.celular || '')
    const [foto, setFoto] = useState(null)
    const [fotoPreview, setFotoPreview] = useState(null)
    const [eliminarFoto, setEliminarFoto] = useState(false)
    const [errores, setErrores] = useState({})
    const [enviando, setEnviando] = useState(false)

    const fotoMostrada = eliminarFoto ? null : (fotoPreview || usuario.foto)
    const ubicacion = textoUbicacion(usuario)

    function elegirFoto(archivo) {
        if (!archivo) return
        if (!archivo.type.startsWith('image/')) {
            setErrores(e => ({ ...e, foto: 'El archivo debe ser una imagen (JPG, PNG o WebP).' }))
            return
        }
        setErrores(e => ({ ...e, foto: undefined }))
        setFoto(archivo)
        setFotoPreview(URL.createObjectURL(archivo))
        setEliminarFoto(false)
    }

    function quitarFoto() {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview)
        setFoto(null); setFotoPreview(null); setEliminarFoto(true)
    }

    async function guardar(e) {
        e.preventDefault()
        const nuevos = {}
        if (!nombres.trim()) nuevos.nombres = 'Escribe tus nombres.'
        if (!apellidos.trim()) nuevos.apellidos = 'Escribe tus apellidos.'
        if (celular.trim() && !normalizarCelular(celular)) nuevos.celular = MENSAJE_CELULAR
        setErrores(nuevos)
        if (Object.keys(nuevos).length > 0) return

        const formData = new FormData()
        if (foto) formData.append('foto', foto)
        else if (eliminarFoto) formData.append('eliminarFoto', 'true')
        formData.append('nombres', nombres.trim())
        formData.append('apellidos', apellidos.trim())
        formData.append('bio', bio.trim())
        // Vacío = no se toca: el celular es obligatorio desde el registro y no se puede borrar.
        if (celular.trim()) formData.append('celular', celular)

        setEnviando(true)
        const respuesta = await fetch(`${API_URL}/api/auth/editar-perfil`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: formData
        })
        const datos = await respuesta.json().catch(() => ({}))
        setEnviando(false)

        if (respuesta.ok) {
            setUsuario(datos.user)
            mostrarToast('Perfil actualizado', 'exito')
            onGuardado()
        } else {
            setErrores({ general: datos.mensaje || 'No se pudo actualizar el perfil' })
        }
    }

    return (
        <Modal onClose={onClose} ancho="max-w-lg">
            <div>
                <h3 className="text-lg font-bold text-volare-azul">Editar perfil</h3>
                <p className="text-sm text-gray-500">Así te ven los demás residentes de Volare</p>
            </div>

            <form onSubmit={guardar} className="flex flex-col gap-5" noValidate>
                <div className="flex items-center gap-4 bg-gradient-to-r from-volare-azul/5 to-transparent rounded-xl p-3">
                    <AvatarUsuario foto={fotoMostrada} size={72} className="border border-gray-200 shadow-sm shrink-0" />
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                            <label className="inline-flex items-center gap-1.5 bg-volare-azul text-white text-sm font-semibold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition">
                                <HiOutlineCamera size={16} /> {fotoMostrada ? 'Cambiar foto' : 'Subir foto'}
                                <input type="file" accept="image/*" className="sr-only" onChange={(e) => elegirFoto(e.target.files[0])} />
                            </label>
                            {fotoMostrada && (
                                <button type="button" onClick={quitarFoto} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:text-red-600 hover:border-red-300 transition">
                                    <HiOutlineTrash size={16} /> Quitar
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Una foto cuadrada se ve mejor.</p>
                        {errores.foto && <p className="text-xs text-red-600" role="alert">{errores.foto}</p>}
                    </div>
                </div>

                <Seccion titulo="Datos personales">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="perfil-nombres" className="text-sm font-semibold text-gray-700">Nombres</label>
                            <input id="perfil-nombres" type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} autoComplete="given-name" aria-invalid={errores.nombres ? 'true' : undefined} className={CLASE_INPUT} />
                            {errores.nombres && <p className="text-xs text-red-600" role="alert">{errores.nombres}</p>}
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="perfil-apellidos" className="text-sm font-semibold text-gray-700">Apellidos</label>
                            <input id="perfil-apellidos" type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} autoComplete="family-name" aria-invalid={errores.apellidos ? 'true' : undefined} className={CLASE_INPUT} />
                            {errores.apellidos && <p className="text-xs text-red-600" role="alert">{errores.apellidos}</p>}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="perfil-bio" className="text-sm font-semibold text-gray-700">Biografía</label>
                        <textarea id="perfil-bio" value={bio} onChange={(e) => setBio(e.target.value.slice(0, MAXIMO_BIO))} rows={3} placeholder="Cuéntanos algo sobre ti" className={`${CLASE_INPUT} resize-none`} />
                        <p className="text-xs text-gray-400 text-right">{bio.length}/{MAXIMO_BIO}</p>
                    </div>
                </Seccion>

                <Seccion titulo="Contacto">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="perfil-celular" className="text-sm font-semibold text-gray-700">Celular</label>
                        <div className="relative">
                            <HiOutlineDevicePhoneMobile size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input id="perfil-celular" type="tel" inputMode="tel" value={celular} onChange={(e) => setCelular(e.target.value)} autoComplete="tel" placeholder="0991234567" aria-invalid={errores.celular ? 'true' : undefined} className={`${CLASE_INPUT} pl-10`} />
                        </div>
                        {errores.celular
                            ? <p className="text-xs text-red-600" role="alert">{errores.celular}</p>
                            : <p className="text-xs text-gray-500">Solo la administración lo ve. Actualízalo si cambias de línea.</p>}
                    </div>
                </Seccion>

                <Seccion titulo="Datos protegidos">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <DatoProtegido etiqueta="Cédula" valor={enmascararCedula(yo?.cedula)} />
                        {ubicacion && <DatoProtegido etiqueta="Casa" valor={ubicacion} />}
                        <div className="sm:col-span-2"><DatoProtegido etiqueta="Correo de acceso" valor={enmascararEmail(yo?.email)} /></div>
                    </div>
                    <p className="text-xs text-gray-500">Estos datos identifican tu cuenta y tu casa. Para cambiarlos, escribe a la administración; el correo se cambia en Seguridad.</p>
                </Seccion>

                {errores.general && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{errores.general}</p>}

                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">Cancelar</button>
                    <button type="submit" disabled={enviando} className="bg-volare-verde text-white px-5 py-2.5 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60">
                        {enviando ? 'Guardando…' : 'Guardar cambios'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ModalEditarPerfil
