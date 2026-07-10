import { useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { HiOutlineCheck, HiOutlineCloudArrowUp, HiOutlineDocumentText, HiXMark } from 'react-icons/hi2'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const PASOS = [
    { numero: 1, titulo: 'Datos personales' },
    { numero: 2, titulo: 'Datos bancarios' },
    { numero: 3, titulo: 'Contrato' },
    { numero: 4, titulo: 'Confirmación' }
]

const MIMETYPES_VALIDOS = ['image/jpeg', 'image/png', 'application/pdf']

const NOMBRES_ESPACIO = {
    CABANA_ARBOL: 'Cabaña Árbol',
    CABANA_MEDIO: 'Cabaña Medio',
    CABANA_RIO: 'Cabaña Río',
    CASA_CLUB: 'Casa Club'
}

const NOMBRES_HORARIO = {
    CABANA_COMPLETO: 'Día completo (10:00 a 18:00)',
    CASA_CLUB_MATUTINO: 'Matutino (09:00 a 13:00)',
    CASA_CLUB_VESPERTINO: 'Vespertino (14:00 a 18:00)',
    CASA_CLUB_NOCTURNO: 'Nocturno (19:00 a 02:00)'
}

function esCabana(espacio) {
    return espacio?.startsWith('CABANA')
}

function calcularMontos(espacio, horario, esParaTercero) {
    if (esCabana(espacio)) {
        return { montoAlquiler: 15, montoGarantia: 25 }
    }
    if (horario === 'CASA_CLUB_NOCTURNO') {
        return esParaTercero
            ? { montoAlquiler: 200, montoGarantia: 200 }
            : { montoAlquiler: 100, montoGarantia: 100 }
    }
    return esParaTercero
        ? { montoAlquiler: 120, montoGarantia: 120 }
        : { montoAlquiler: 80, montoGarantia: 80 }
}

function formatearFechaLocal(fechaStr) {
    if (!fechaStr) return ''
    const [anio, mes, dia] = fechaStr.split('-').map(Number)
    return format(new Date(anio, mes - 1, dia), "d 'de' MMMM 'de' yyyy", { locale: es })
}

function contratoUrl(espacio) {
    return esCabana(espacio) ? '/contratos/contrato-cabana.pdf' : '/contratos/contrato-casa-club.pdf'
}

function truncarCuenta(numero) {
    const limpio = (numero ?? '').trim()
    if (limpio.length <= 4) return limpio
    return `${'*'.repeat(limpio.length - 4)}${limpio.slice(-4)}`
}

function Campo({ label, value, onChange, type = 'text' }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
            />
        </div>
    )
}

function ZonaArchivo({ label, archivo, onSeleccionar, onQuitar }) {
    const [arrastrando, setArrastrando] = useState(false)
    const inputId = `archivo-${label.replace(/\s+/g, '-').toLowerCase()}`

    function manejarLista(lista) {
        const seleccionado = lista?.[0]
        if (seleccionado) onSeleccionar(seleccionado)
    }

    function manejarDrop(e) {
        e.preventDefault()
        setArrastrando(false)
        manejarLista(e.dataTransfer.files)
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {archivo ? (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    {archivo.tipo === 'imagen' ? (
                        <img src={archivo.previewUrl} className="w-10 h-10 object-cover rounded shrink-0" />
                    ) : (
                        <HiOutlineDocumentText size={24} className="text-volare-azul shrink-0" />
                    )}
                    <span className="text-sm text-gray-700 truncate flex-1">{archivo.file.name}</span>
                    <button
                        type="button"
                        onClick={onQuitar}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                        aria-label="Quitar"
                    >
                        <HiXMark size={18} />
                    </button>
                </div>
            ) : (
                <label
                    htmlFor={inputId}
                    onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                    onDragLeave={() => setArrastrando(false)}
                    onDrop={manejarDrop}
                    className={`cursor-pointer flex flex-col items-center justify-center gap-1 border-2 border-dashed rounded-lg px-3 py-6 text-center transition ${
                        arrastrando ? 'border-volare-azul bg-volare-azul/5' : 'border-gray-300 hover:border-volare-azul'
                    }`}
                >
                    <HiOutlineCloudArrowUp size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-500">Arrastra un archivo aquí o haz clic</span>
                    <span className="text-[11px] text-gray-400">JPG, PNG o PDF</span>
                    <input
                        id={inputId}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                        onChange={(e) => manejarLista(e.target.files)}
                        className="hidden"
                    />
                </label>
            )}
        </div>
    )
}

function FormularioReserva({ espacio, fecha, horario }) {
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const navigate = useNavigate()

    const [paso, setPaso] = useState(1)
    const [enviando, setEnviando] = useState(false)

    const [nombres, setNombres] = useState(usuario?.nombre ?? '')
    const [apellidos, setApellidos] = useState('')
    const [correo, setCorreo] = useState(usuario?.email ?? '')
    const [celular, setCelular] = useState('')
    const [cedula, setCedula] = useState('')
    const [motivoEvento, setMotivoEvento] = useState('')
    const [esParaTercero, setEsParaTercero] = useState(false)

    const [bancoNombre, setBancoNombre] = useState('')
    const [numeroCuenta, setNumeroCuenta] = useState('')
    const [tipoCuenta, setTipoCuenta] = useState('')
    const [cedulaRucBancario, setCedulaRucBancario] = useState('')

    const [comprobantePago, setComprobantePago] = useState(null)
    const [listaInvitados, setListaInvitados] = useState(null)
    const [contratoFirmado, setContratoFirmado] = useState(null)

    const [aceptaReglamento, setAceptaReglamento] = useState(false)

    const mostrarToggleTercero = espacio === 'CASA_CLUB'
    const aplicaTercero = mostrarToggleTercero && esParaTercero

    const { montoAlquiler, montoGarantia } = useMemo(
        () => calcularMontos(espacio, horario, aplicaTercero),
        [espacio, horario, aplicaTercero]
    )
    const montoTotal = montoAlquiler + montoGarantia

    function crearManejadorArchivo(setter, archivoActual) {
        return (file) => {
            if (!MIMETYPES_VALIDOS.includes(file.type)) {
                mostrarToast('Solo se aceptan imágenes JPG/PNG o archivos PDF', 'error')
                return
            }
            if (archivoActual?.previewUrl) URL.revokeObjectURL(archivoActual.previewUrl)
            const tipo = file.type === 'application/pdf' ? 'pdf' : 'imagen'
            setter({ file, tipo, previewUrl: tipo === 'imagen' ? URL.createObjectURL(file) : null })
        }
    }

    function crearQuitarArchivo(setter, archivoActual) {
        return () => {
            if (archivoActual?.previewUrl) URL.revokeObjectURL(archivoActual.previewUrl)
            setter(null)
        }
    }

    function validarPaso1() {
        if (!nombres.trim() || !apellidos.trim()) return 'Ingresa tus nombres y apellidos'
        if (!/^\S+@\S+\.\S+$/.test(correo)) return 'Ingresa un correo válido'
        if (!celular.trim()) return 'Ingresa tu número de celular'
        if (!/^\d{10}$/.test(cedula)) return 'La cédula debe tener 10 dígitos'
        if (!motivoEvento.trim()) return 'Describe el motivo del evento'
        return null
    }

    function validarPaso2() {
        if (!bancoNombre.trim()) return 'Ingresa el nombre del banco'
        if (!numeroCuenta.trim()) return 'Ingresa el número de cuenta'
        if (!tipoCuenta) return 'Selecciona el tipo de cuenta'
        if (!cedulaRucBancario.trim()) return 'Ingresa la cédula o RUC'
        return null
    }

    function validarPaso3() {
        if (!comprobantePago) return 'Sube el comprobante de pago'
        if (!listaInvitados) return 'Sube la lista de invitados'
        if (!contratoFirmado) return 'Sube el contrato firmado'
        return null
    }

    function siguiente() {
        const validadores = { 1: validarPaso1, 2: validarPaso2, 3: validarPaso3 }
        const error = validadores[paso]?.()
        if (error) {
            mostrarToast(error, 'error')
            return
        }
        setPaso(p => Math.min(p + 1, 4))
    }

    function atras() {
        setPaso(p => Math.max(p - 1, 1))
    }

    async function enviarSolicitud() {
        if (!aceptaReglamento) {
            mostrarToast('Debes aceptar el reglamento del contrato', 'error')
            return
        }

        setEnviando(true)
        try {
            const formData = new FormData()
            formData.append('espacio', espacio)
            formData.append('fecha', fecha)
            formData.append('horario', horario)
            formData.append('motivoEvento', motivoEvento)
            formData.append('nombres', nombres)
            formData.append('apellidos', apellidos)
            formData.append('correo', correo)
            formData.append('celular', celular)
            formData.append('cedula', cedula)
            formData.append('esParaTercero', String(aplicaTercero))
            formData.append('bancoNombre', bancoNombre)
            formData.append('numeroCuenta', numeroCuenta)
            formData.append('tipoCuenta', tipoCuenta)
            formData.append('cedulaRucBancario', cedulaRucBancario)
            formData.append('comprobantePago', comprobantePago.file)
            formData.append('listaInvitados', listaInvitados.file)
            formData.append('contratoFirmado', contratoFirmado.file)

            const respuesta = await fetch(`${API_URL}/api/reservas`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })

            if (respuesta.ok) {
                mostrarToast('Tu solicitud de reserva fue enviada, espera la aprobación del administrador', 'exito')
                navigate('/reservas/mis-reservas')
            } else {
                const datos = await respuesta.json()
                mostrarToast(datos.error || 'No se pudo crear la reserva', 'error')
            }
        } catch {
            mostrarToast('Error de conexión, intenta nuevamente', 'error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-6">
            <div className="bg-volare-azul/5 border border-volare-azul/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sticky top-2 z-10">
                <div className="text-sm text-gray-700">
                    <span className="font-semibold text-volare-azul">{NOMBRES_ESPACIO[espacio]}</span>
                    {' — '}{formatearFechaLocal(fecha)}{' — '}{NOMBRES_HORARIO[horario]}
                </div>
                <div className="text-right shrink-0">
                    <p className="font-bold text-volare-azul text-lg leading-none">Total: ${montoTotal}</p>
                    <p className="text-xs text-gray-500">${montoAlquiler} alquiler + ${montoGarantia} garantía</p>
                </div>
            </div>

            <div className="flex items-start justify-center gap-1 sm:gap-4">
                {PASOS.map((p, i) => (
                    <div key={p.numero} className="flex items-start gap-1 sm:gap-4">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${
                                paso === p.numero
                                    ? 'bg-volare-azul text-white'
                                    : paso > p.numero
                                        ? 'bg-volare-verde text-white'
                                        : 'bg-gray-200 text-gray-500'
                            }`}>
                                {paso > p.numero ? <HiOutlineCheck size={18} /> : p.numero}
                            </div>
                            <span className="text-[11px] text-gray-500 hidden sm:block text-center w-20">{p.titulo}</span>
                        </div>
                        {i < PASOS.length - 1 && (
                            <div className={`w-4 sm:w-10 h-0.5 mt-4 ${paso > p.numero ? 'bg-volare-verde' : 'bg-gray-200'}`} />
                        )}
                    </div>
                ))}
            </div>

            {paso === 1 && (
                <div key="paso-1" className="flex flex-col gap-4 animate-volare-barrido-derecha">
                    <h2 className="text-lg font-semibold text-volare-azul">Datos personales</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Nombres" value={nombres} onChange={setNombres} />
                        <Campo label="Apellidos" value={apellidos} onChange={setApellidos} />
                        <Campo label="Correo" type="email" value={correo} onChange={setCorreo} />
                        <Campo label="Celular" value={celular} onChange={setCelular} />
                        <Campo label="Cédula" value={cedula} onChange={(v) => setCedula(v.replace(/\D/g, '').slice(0, 10))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">Motivo del evento</label>
                        <textarea
                            value={motivoEvento}
                            onChange={(e) => setMotivoEvento(e.target.value)}
                            rows={3}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                        />
                    </div>
                    {mostrarToggleTercero && (
                        <label className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={esParaTercero}
                                onChange={(e) => setEsParaTercero(e.target.checked)}
                                className="mt-1 w-4 h-4 accent-volare-azul"
                            />
                            <span className="text-sm text-gray-700">
                                ¿Es para un tercero (beneficiario particular, no residente ni familiar de primer grado)?
                            </span>
                        </label>
                    )}
                </div>
            )}

            {paso === 2 && (
                <div key="paso-2" className="flex flex-col gap-4 animate-volare-barrido-derecha">
                    <h2 className="text-lg font-semibold text-volare-azul">Datos bancarios</h2>
                    <p className="text-sm text-gray-500">
                        Estos datos se usan únicamente para devolver tu garantía después del evento, si se cumplen las condiciones del reglamento.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Campo label="Nombre del banco" value={bancoNombre} onChange={setBancoNombre} />
                        <Campo label="Número de cuenta" value={numeroCuenta} onChange={setNumeroCuenta} />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Tipo de cuenta</label>
                            <select
                                value={tipoCuenta}
                                onChange={(e) => setTipoCuenta(e.target.value)}
                                className={`border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul ${tipoCuenta === '' ? 'text-gray-400' : 'text-gray-900'}`}
                            >
                                <option value="" disabled hidden>Selecciona un tipo</option>
                                <option value="AHORROS">Ahorros</option>
                                <option value="CORRIENTE">Corriente</option>
                            </select>
                        </div>
                        <Campo label="Cédula o RUC" value={cedulaRucBancario} onChange={setCedulaRucBancario} />
                    </div>
                </div>
            )}

            {paso === 3 && (
                <div key="paso-3" className="flex flex-col gap-4 animate-volare-barrido-derecha">
                    <h2 className="text-lg font-semibold text-volare-azul">Contrato y documentos</h2>
                    <a
                        href={contratoUrl(espacio)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start flex items-center gap-2 bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        <HiOutlineDocumentText size={20} />
                        Descargar contrato
                    </a>
                    <p className="text-sm text-gray-500">
                        Descarga el contrato, complétalo a mano, fírmalo, escanéalo o tómale una foto legible, y súbelo aquí.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <ZonaArchivo
                            label="Comprobante de pago"
                            archivo={comprobantePago}
                            onSeleccionar={crearManejadorArchivo(setComprobantePago, comprobantePago)}
                            onQuitar={crearQuitarArchivo(setComprobantePago, comprobantePago)}
                        />
                        <ZonaArchivo
                            label="Lista de invitados"
                            archivo={listaInvitados}
                            onSeleccionar={crearManejadorArchivo(setListaInvitados, listaInvitados)}
                            onQuitar={crearQuitarArchivo(setListaInvitados, listaInvitados)}
                        />
                        <ZonaArchivo
                            label="Contrato firmado"
                            archivo={contratoFirmado}
                            onSeleccionar={crearManejadorArchivo(setContratoFirmado, contratoFirmado)}
                            onQuitar={crearQuitarArchivo(setContratoFirmado, contratoFirmado)}
                        />
                    </div>
                </div>
            )}

            {paso === 4 && (
                <div key="paso-4" className="flex flex-col gap-4 animate-volare-barrido-derecha">
                    <h2 className="text-lg font-semibold text-volare-azul">Resumen y confirmación</h2>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col gap-2 text-sm text-gray-700">
                        <p><span className="font-semibold">Espacio:</span> {NOMBRES_ESPACIO[espacio]}</p>
                        <p><span className="font-semibold">Fecha:</span> {formatearFechaLocal(fecha)}</p>
                        <p><span className="font-semibold">Horario:</span> {NOMBRES_HORARIO[horario]}</p>
                        {mostrarToggleTercero && (
                            <p><span className="font-semibold">Para un tercero:</span> {esParaTercero ? 'Sí' : 'No'}</p>
                        )}
                        <hr className="border-gray-200" />
                        <p><span className="font-semibold">Nombres:</span> {nombres} {apellidos}</p>
                        <p><span className="font-semibold">Correo:</span> {correo}</p>
                        <p><span className="font-semibold">Celular:</span> {celular}</p>
                        <p><span className="font-semibold">Cédula:</span> {cedula}</p>
                        <p><span className="font-semibold">Motivo:</span> {motivoEvento}</p>
                        <hr className="border-gray-200" />
                        <p><span className="font-semibold">Banco:</span> {bancoNombre}</p>
                        <p>
                            <span className="font-semibold">Cuenta:</span> {truncarCuenta(numeroCuenta)}
                            {' '}({tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente'})
                        </p>
                        <hr className="border-gray-200" />
                        <p><span className="font-semibold">Comprobante de pago:</span> {comprobantePago?.file.name}</p>
                        <p><span className="font-semibold">Lista de invitados:</span> {listaInvitados?.file.name}</p>
                        <p><span className="font-semibold">Contrato firmado:</span> {contratoFirmado?.file.name}</p>
                    </div>
                    <div className="bg-volare-verde/10 border border-volare-verde/30 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-volare-verde">Total: ${montoTotal}</p>
                        <p className="text-xs text-gray-500">${montoAlquiler} alquiler + ${montoGarantia} garantía</p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={aceptaReglamento}
                            onChange={(e) => setAceptaReglamento(e.target.checked)}
                            className="mt-1 w-4 h-4 accent-volare-verde"
                        />
                        <span className="text-sm text-gray-700">He leído y acepto el reglamento del contrato descargado</span>
                    </label>
                </div>
            )}

            <div className="flex justify-between pt-2">
                {paso > 1 ? (
                    <button
                        type="button"
                        onClick={atras}
                        className="px-6 py-2 rounded-lg font-semibold border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                    >
                        Atrás
                    </button>
                ) : <span />}

                {paso < 4 ? (
                    <button
                        type="button"
                        onClick={siguiente}
                        className="bg-volare-azul text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Siguiente
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={enviarSolicitud}
                        disabled={!aceptaReglamento || enviando}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${
                            aceptaReglamento && !enviando
                                ? 'bg-volare-verde text-white hover:opacity-90 cursor-pointer'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        {enviando ? 'Enviando...' : 'Enviar Solicitud de Reserva'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FormularioReserva
