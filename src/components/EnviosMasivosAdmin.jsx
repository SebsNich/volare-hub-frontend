import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { leerCorreos, problemaConAdjuntos, resumenResultado, mensajeVacio, problemaConRemitente, TIPOS_ADJUNTO, MAX_ADJUNTOS } from '../utilities/informe'
import ArchivoAdjunto from './ArchivoAdjunto'
import EditorMensaje from './EditorMensaje'

const token = () => localStorage.getItem('token')
const campo = 'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full'

// Envíos masivos (por ejemplo, el informe económico mensual): el administrador elige
// remitente y destinatarios, escribe el mensaje con formato y, si quiere, lo publica
// como COMUNICADO visible solo para residentes con cuenta aprobada.
function EnviosMasivosAdmin() {
    const { mostrarToast } = useToast()
    const [asunto, setAsunto] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [claveEditor, setClaveEditor] = useState(0) // cambiarla vacía el editor
    const [remitenteNombre, setRemitenteNombre] = useState('')
    const [remitenteCorreo, setRemitenteCorreo] = useState('')
    const [dominio, setDominio] = useState('urbvolare.com')
    const [enviarCorreo, setEnviarCorreo] = useState(true)
    const [publicar, setPublicar] = useState(false)
    const [modo, setModo] = useState('TODOS')
    const [correos, setCorreos] = useState('')
    const [archivos, setArchivos] = useState([])
    const [residentes, setResidentes] = useState(null)
    const [confirmando, setConfirmando] = useState(false)
    const [enviando, setEnviando] = useState(false)
    const [resultado, setResultado] = useState(null)

    useEffect(() => {
        fetch(`${API_URL}/api/informes/destinatarios`, { headers: { Authorization: `Bearer ${token()}` } })
            .then(r => r.json())
            .then(d => {
                setResidentes(d.residentes ?? null)
                setRemitenteNombre(d.remitente?.nombre ?? '')
                setRemitenteCorreo(d.remitente?.correo ?? '')
                if (d.dominioRemitente) setDominio(d.dominioRemitente)
            })
            .catch(() => setResidentes(null))
    }, [])

    const lista = useMemo(() => leerCorreos(correos), [correos])
    const cantidad = modo === 'TODOS' ? residentes : lista.validos.length
    const problemaArchivos = problemaConAdjuntos(archivos)

    function agregarArchivos(evento) {
        // Se copian ya: al vaciar el campo, la lista del navegador queda vacía.
        const nuevos = Array.from(evento.target.files)
        setArchivos(previos => [...previos, ...nuevos])
        evento.target.value = ''
    }

    function problemaDelFormulario() {
        if (!asunto.trim()) return 'Escribe el asunto'
        if (mensajeVacio(mensaje)) return 'Escribe el mensaje'
        if (enviarCorreo) {
            const problemaRemitente = problemaConRemitente(remitenteCorreo, dominio)
            if (problemaRemitente) return problemaRemitente
        }
        if (!enviarCorreo && !publicar) return 'Elige al menos una opción: enviar por correo o publicar como comunicado'
        if (problemaArchivos) return problemaArchivos
        if (enviarCorreo && modo === 'LISTA' && lista.invalidos.length > 0) return `Estas direcciones no tienen formato de correo: ${lista.invalidos.slice(0, 3).join(', ')}`
        if (enviarCorreo && !cantidad) return 'No hay destinatarios'
        return null
    }

    function pedirConfirmacion(evento) {
        evento.preventDefault()
        const problema = problemaDelFormulario()
        if (problema) return mostrarToast(problema, 'error')
        setConfirmando(true)
    }

    async function enviar() {
        setEnviando(true)
        setResultado(null)
        try {
            const datos = new FormData()
            datos.append('asunto', asunto)
            datos.append('mensaje', mensaje)
            datos.append('remitenteNombre', remitenteNombre)
            datos.append('remitenteCorreo', remitenteCorreo)
            datos.append('enviarCorreo', String(enviarCorreo))
            datos.append('publicar', String(publicar))
            datos.append('modoDestinatarios', modo)
            if (modo === 'LISTA') datos.append('destinatarios', correos)
            archivos.forEach(a => datos.append('adjuntos', a))
            const respuesta = await fetch(`${API_URL}/api/informes`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: datos })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) throw new Error(cuerpo.error || cuerpo.mensaje || 'No se pudo realizar el envío')
            setResultado(cuerpo)
            mostrarToast('Envío realizado', 'exito')
            setAsunto(''); setMensaje(''); setClaveEditor(k => k + 1); setCorreos(''); setArchivos([]); setPublicar(false)
        } catch (falla) {
            mostrarToast(falla.message, 'error')
        } finally {
            setEnviando(false)
            setConfirmando(false)
        }
    }

    const destino = enviarCorreo
        ? `Se enviará desde ${remitenteCorreo || '…'} a ${cantidad ?? '…'} ${cantidad === 1 ? 'destinatario' : 'destinatarios'}.`
        : 'No se enviará correo.'

    return (
        <div className="flex flex-col gap-4">
            <form onSubmit={pedirConfirmacion} className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-4" aria-label="Envíos masivos">
                <div>
                    <h3 className="text-base font-semibold text-gray-800">Envíos masivos</h3>
                    <p className="text-sm text-gray-500">Envía correos a los residentes (por ejemplo, el informe económico mensual) y, si quieres, publícalos como comunicado.</p>
                </div>

                <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <legend className="text-sm font-semibold text-gray-700 mb-1">Remitente</legend>
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        Nombre que verán los residentes
                        <input className={campo} maxLength={60} value={remitenteNombre} onChange={(e) => setRemitenteNombre(e.target.value)} aria-label="Nombre del remitente" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-gray-700">
                        Correo desde el que se envía
                        <input type="email" className={campo} value={remitenteCorreo} onChange={(e) => setRemitenteCorreo(e.target.value)} placeholder={`contabilidad@${dominio}`} aria-label="Correo del remitente" />
                        <span className="text-xs text-gray-500">Debe terminar en @{dominio}. Las respuestas llegarán a este correo.</span>
                    </label>
                </fieldset>

                <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                    Asunto
                    <input className={campo} maxLength={150} value={asunto} onChange={(e) => setAsunto(e.target.value)} placeholder="Informe económico de octubre 2026" />
                </label>

                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-700">Mensaje</span>
                    <EditorMensaje key={claveEditor} onChange={setMensaje} placeholder="Estimados residentes: adjuntamos el informe económico del mes…" />
                    <p className="text-xs text-gray-500">Puedes usar negrita, listas, enlaces e imágenes. Al publicarlo como comunicado se guarda como texto simple.</p>
                </div>

                <fieldset className="flex flex-col gap-2">
                    <legend className="text-sm font-semibold text-gray-700 mb-1">Opciones de envío</legend>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                        <input type="checkbox" checked={enviarCorreo} onChange={(e) => setEnviarCorreo(e.target.checked)} />
                        Enviar por correo
                    </label>
                    {enviarCorreo && (
                        <div className="ml-6 flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="radio" name="modo" checked={modo === 'TODOS'} onChange={() => setModo('TODOS')} />
                                Todos los residentes registrados y aprobados {residentes !== null && <span className="text-gray-500">({residentes})</span>}
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="radio" name="modo" checked={modo === 'LISTA'} onChange={() => setModo('LISTA')} />
                                Correos específicos
                            </label>
                            {modo === 'LISTA' && (
                                <div>
                                    <textarea className={`${campo} min-h-24`} value={correos} onChange={(e) => setCorreos(e.target.value)} placeholder="correo1@ejemplo.com; correo2@ejemplo.com; correo3@ejemplo.com" aria-label="Correos de los destinatarios" />
                                    <p className="text-xs text-gray-500 mt-1">Sepáralos con punto y coma (;). Válidos: {lista.validos.length}{lista.invalidos.length > 0 && <span className="text-red-600"> · Mal escritos: {lista.invalidos.join(', ')}</span>}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input type="checkbox" className="mt-1" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} />
                        <span>Publicar como <strong>comunicado</strong> en la plataforma<br /><span className="text-xs text-gray-500">Solo lo verán los residentes cuya cuenta fue aprobada por un administrador.</span></span>
                    </label>
                </fieldset>

                <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-700">Documentos adjuntos (hasta {MAX_ADJUNTOS})</span>
                    <input type="file" multiple accept={TIPOS_ADJUNTO} onChange={agregarArchivos} className="text-sm" aria-label="Adjuntar documentos" />
                    <p className="text-xs text-gray-500">PDF, Excel, Word, CSV o imágenes. Hasta 10 MB cada uno y 20 MB en total.</p>
                    {archivos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {archivos.map((a, i) => (
                                <ArchivoAdjunto key={`${a.name}-${i}`} nombre={a.name} onQuitar={() => setArchivos(archivos.filter((_, j) => j !== i))} />
                            ))}
                        </div>
                    )}
                    {problemaArchivos && <p className="text-xs text-red-600">{problemaArchivos}</p>}
                </div>

                <p className="text-sm text-gray-600">{destino}</p>

                {!confirmando ? (
                    <button type="submit" className="self-start bg-volare-azul text-white px-5 py-2 rounded-lg font-semibold">Enviar</button>
                ) : (
                    <div className="border border-amber-300 bg-amber-50 rounded-xl p-4 flex flex-col gap-3" role="alertdialog" aria-label="Confirmar envío">
                        <p className="text-sm text-amber-900">
                            <strong>¿Confirmas el envío?</strong> {destino}{publicar ? ' Además se publicará como comunicado.' : ''} Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-2">
                            <button type="button" onClick={enviar} disabled={enviando} className="bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50">
                                {enviando ? 'Enviando…' : 'Sí, enviar'}
                            </button>
                            <button type="button" onClick={() => setConfirmando(false)} disabled={enviando} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold">Cancelar</button>
                        </div>
                    </div>
                )}
            </form>

            {resultado && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-900 flex flex-col gap-2" role="status">
                    <p>{resumenResultado(resultado)}</p>
                    {resultado.correo?.correosFallidos?.length > 0 && (
                        <textarea readOnly className={`${campo} bg-white`} value={resultado.correo.correosFallidos.join('; ')} aria-label="Correos que no se enviaron" />
                    )}
                </div>
            )}
        </div>
    )
}

export default EnviosMasivosAdmin
