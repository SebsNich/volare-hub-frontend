import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { HiOutlineArrowLeft, HiOutlineCheck, HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineExclamationTriangle, HiXMark } from 'react-icons/hi2'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { NOMBRES_ESPACIO_RESERVA as NOMBRES_ESPACIO, NOMBRES_HORARIO_RESERVA as NOMBRES_HORARIO, BANCOS_ECUADOR } from '../utilities/constantes'
import { esCedulaValida } from '../utilities/helpers'
import SelectorBuscable from './SelectorBuscable'

const PASOS = [
    { numero: 1, titulo: 'Datos personales' },
    { numero: 2, titulo: 'Datos bancarios' },
    { numero: 3, titulo: 'Contrato' },
    { numero: 4, titulo: 'Confirmación' }
]

const MIMETYPES_VALIDOS = ['image/jpeg', 'image/png', 'application/pdf']

const SLOTS_ARCHIVOS = [
    { slot: 'comprobantePago', label: 'Comprobante de pago' },
    { slot: 'listaInvitados', label: 'Lista de invitados' },
    { slot: 'contratoFirmado', label: 'Contrato firmado' }
]

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

function rutaCalendario(espacio) {
    return esCabana(espacio) ? '/reservas/cabanas' : '/reservas/casa-club'
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

function ZonaArchivosMultiple({ label, archivosNuevos, archivosExistentes, onAgregar, onQuitarNuevo, onQuitarExistente }) {
    const [arrastrando, setArrastrando] = useState(false)
    const inputId = `archivo-${label.replace(/\s+/g, '-').toLowerCase()}`
    const hayArchivos = archivosExistentes.length > 0 || archivosNuevos.length > 0

    function manejarLista(lista) {
        const seleccionados = Array.from(lista ?? [])
        if (seleccionados.length) onAgregar(seleccionados)
    }

    function manejarDrop(e) {
        e.preventDefault()
        setArrastrando(false)
        manejarLista(e.dataTransfer.files)
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            {hayArchivos && (
                <div className="flex flex-col gap-2">
                    {archivosExistentes.map((url) => (
                        <div key={url} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            <HiOutlineDocumentText size={20} className="text-volare-azul shrink-0" />
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-volare-azul underline truncate flex-1"
                            >
                                Ver archivo
                            </a>
                            <button
                                type="button"
                                onClick={() => onQuitarExistente(url)}
                                className="text-gray-400 hover:text-red-500 shrink-0"
                                aria-label="Quitar"
                            >
                                <HiXMark size={18} />
                            </button>
                        </div>
                    ))}
                    {archivosNuevos.map((archivo, index) => (
                        <div key={`${archivo.file.name}-${index}`} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                            {archivo.tipo === 'imagen' ? (
                                <img src={archivo.previewUrl} className="w-10 h-10 object-cover rounded shrink-0" />
                            ) : (
                                <HiOutlineDocumentText size={24} className="text-volare-azul shrink-0" />
                            )}
                            <span className="text-sm text-gray-700 truncate flex-1">{archivo.file.name}</span>
                            <button
                                type="button"
                                onClick={() => onQuitarNuevo(index)}
                                className="text-gray-400 hover:text-red-500 shrink-0"
                                aria-label="Quitar"
                            >
                                <HiXMark size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
                <span className="text-xs text-gray-500">{hayArchivos ? 'Agregar otro archivo' : 'Arrastra un archivo aquí o haz clic'}</span>
                <span className="text-[11px] text-gray-400">JPG, PNG o PDF</span>
                <input
                    id={inputId}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={(e) => { manejarLista(e.target.files); e.target.value = '' }}
                    className="hidden"
                />
            </label>
        </div>
    )
}

function FormularioReserva({ reservaId, espacio: espacioProp, fecha: fechaProp, horario: horarioProp }) {
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const navigate = useNavigate()

    const modoEdicion = !!reservaId

    const [cargandoDatos, setCargandoDatos] = useState(modoEdicion)
    const [espacio, setEspacio] = useState(espacioProp ?? null)
    const [fecha, setFecha] = useState(fechaProp ?? null)
    const [horario, setHorario] = useState(horarioProp ?? null)

    const [paso, setPaso] = useState(1)
    const [enviando, setEnviando] = useState(false)

    const [nombres, setNombres] = useState(usuario?.nombres ?? '')
    const [apellidos, setApellidos] = useState(usuario?.apellidos ?? '')
    const [correo, setCorreo] = useState(usuario?.email ?? '')
    const [celular, setCelular] = useState(usuario?.celular ?? '')
    const [cedula, setCedula] = useState(usuario?.cedula ?? '')
    const [manzana, setManzana] = useState(usuario?.manzana ?? '')
    const [villa, setVilla] = useState(usuario?.villa ?? '')
    const [motivoEvento, setMotivoEvento] = useState('')
    const [esParaTercero, setEsParaTercero] = useState(false)

    const [terceroNombre, setTerceroNombre] = useState('')
    const [terceroCedula, setTerceroCedula] = useState('')
    const [terceroCorreo, setTerceroCorreo] = useState('')
    const [terceroCelular, setTerceroCelular] = useState('')

    const [bancoNombre, setBancoNombre] = useState('')
    const [numeroCuenta, setNumeroCuenta] = useState('')
    const [tipoCuenta, setTipoCuenta] = useState('')
    const [cedulaRucBancario, setCedulaRucBancario] = useState('')

    const [comprobantePago, setComprobantePago] = useState([])
    const [listaInvitados, setListaInvitados] = useState([])
    const [contratoFirmado, setContratoFirmado] = useState([])
    const [archivosExistentes, setArchivosExistentes] = useState({ comprobantePago: [], listaInvitados: [], contratoFirmado: [] })

    const [aceptaReglamento, setAceptaReglamento] = useState(false)
    const [observacionAdmin, setObservacionAdmin] = useState(null)

    useEffect(() => {
        if (!modoEdicion) return

        async function cargarReserva() {
            try {
                const respuesta = await fetch(`${API_URL}/api/reservas/${reservaId}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (!respuesta.ok) throw new Error('No se pudo cargar la reserva')
                const datos = await respuesta.json()

                if (datos.estado !== 'PENDIENTE') {
                    mostrarToast('Solo puedes editar reservas pendientes', 'error')
                    navigate('/reservas/mis-reservas', { replace: true })
                    return
                }

                setEspacio(datos.espacio)
                setFecha(datos.fecha.slice(0, 10))
                setHorario(datos.horario)
                setManzana(datos.manzana)
                setVilla(datos.villa)
                setNombres(datos.nombres)
                setApellidos(datos.apellidos)
                setCorreo(datos.correo)
                setCelular(datos.celular)
                setCedula(datos.cedula)
                setMotivoEvento(datos.motivoEvento)
                setEsParaTercero(datos.esParaTercero)
                setTerceroNombre(datos.terceroNombre ?? '')
                setTerceroCedula(datos.terceroCedula ?? '')
                setTerceroCorreo(datos.terceroCorreo ?? '')
                setTerceroCelular(datos.terceroCelular ?? '')
                setBancoNombre(datos.bancoNombre)
                setNumeroCuenta(datos.numeroCuenta)
                setTipoCuenta(datos.tipoCuenta)
                setCedulaRucBancario(datos.cedulaRucBancario)
                setObservacionAdmin(datos.observacionAdmin ?? null)
                setArchivosExistentes({
                    comprobantePago: datos.comprobantePagoUrls ?? [],
                    listaInvitados: datos.listaInvitadosUrls ?? [],
                    contratoFirmado: datos.contratoFirmadoUrls ?? []
                })
            } catch {
                mostrarToast('No se pudo cargar la reserva', 'error')
                navigate('/reservas/mis-reservas', { replace: true })
            } finally {
                setCargandoDatos(false)
            }
        }
        cargarReserva()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reservaId])

    const mostrarToggleTercero = espacio === 'CASA_CLUB'
    const aplicaTercero = mostrarToggleTercero && esParaTercero

    const { montoAlquiler, montoGarantia } = useMemo(
        () => calcularMontos(espacio, horario, aplicaTercero),
        [espacio, horario, aplicaTercero]
    )
    const montoTotal = montoAlquiler + montoGarantia

    const archivosPorSlot = { comprobantePago: [comprobantePago, setComprobantePago], listaInvitados: [listaInvitados, setListaInvitados], contratoFirmado: [contratoFirmado, setContratoFirmado] }

    function crearAgregarArchivos(setter, archivosActuales) {
        return (files) => {
            const nuevos = []
            for (const file of files) {
                if (!MIMETYPES_VALIDOS.includes(file.type)) {
                    mostrarToast('Solo se aceptan imágenes JPG/PNG o archivos PDF', 'error')
                    continue
                }
                const tipo = file.type === 'application/pdf' ? 'pdf' : 'imagen'
                nuevos.push({ file, tipo, previewUrl: tipo === 'imagen' ? URL.createObjectURL(file) : null })
            }
            if (nuevos.length) setter([...archivosActuales, ...nuevos])
        }
    }

    function crearQuitarArchivoNuevo(setter, archivosActuales) {
        return (index) => {
            const archivo = archivosActuales[index]
            if (archivo?.previewUrl) URL.revokeObjectURL(archivo.previewUrl)
            setter(archivosActuales.filter((_, i) => i !== index))
        }
    }

    function crearQuitarArchivoExistente(slot) {
        return (url) => {
            setArchivosExistentes(prev => ({ ...prev, [slot]: prev[slot].filter(u => u !== url) }))
        }
    }

    function validarPaso1() {
        if (!manzana.trim() || !villa.trim()) return 'Ingresa la manzana y la villa'
        if (!nombres.trim() || !apellidos.trim()) return 'Ingresa tus nombres y apellidos'
        if (!/^\S+@\S+\.\S+$/.test(correo)) return 'Ingresa un correo válido'
        if (!celular.trim()) return 'Ingresa tu número de celular'
        if (!esCedulaValida(cedula)) return 'La cédula debe tener 10 dígitos'
        if (!motivoEvento.trim()) return 'Describe el motivo del evento'
        if (aplicaTercero) {
            if (!terceroNombre.trim()) return 'Ingresa el nombre completo del tercero'
            if (!esCedulaValida(terceroCedula)) return 'La cédula del tercero debe tener 10 dígitos'
            if (!/^\S+@\S+\.\S+$/.test(terceroCorreo)) return 'Ingresa un correo válido para el tercero'
            if (!terceroCelular.trim()) return 'Ingresa el celular del tercero'
        }
        return null
    }

    function validarPaso2() {
        if (!bancoNombre.trim()) return 'Ingresa el nombre del banco'
        if (!numeroCuenta.trim()) return 'Ingresa el número de cuenta'
        if (!tipoCuenta) return 'Selecciona el tipo de cuenta'
        if (cedulaRucBancario.length !== 10 && cedulaRucBancario.length !== 13) return 'La cédula debe tener 10 dígitos o el RUC 13 dígitos'
        return null
    }

    function siguiente() {
        const validadores = { 1: validarPaso1, 2: validarPaso2 }
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
            if (!modoEdicion) {
                formData.append('espacio', espacio)
                formData.append('fecha', fecha)
                formData.append('horario', horario)
            }
            formData.append('motivoEvento', motivoEvento)
            formData.append('manzana', manzana)
            formData.append('villa', villa)
            formData.append('nombres', nombres)
            formData.append('apellidos', apellidos)
            formData.append('correo', correo)
            formData.append('celular', celular)
            formData.append('cedula', cedula)
            formData.append('esParaTercero', String(aplicaTercero))
            formData.append('terceroNombre', terceroNombre)
            formData.append('terceroCedula', terceroCedula)
            formData.append('terceroCorreo', terceroCorreo)
            formData.append('terceroCelular', terceroCelular)
            formData.append('bancoNombre', bancoNombre)
            formData.append('numeroCuenta', numeroCuenta)
            formData.append('tipoCuenta', tipoCuenta)
            formData.append('cedulaRucBancario', cedulaRucBancario)
            if (modoEdicion) {
                formData.append('comprobantePagoExistente', JSON.stringify(archivosExistentes.comprobantePago))
                formData.append('listaInvitadosExistente', JSON.stringify(archivosExistentes.listaInvitados))
                formData.append('contratoFirmadoExistente', JSON.stringify(archivosExistentes.contratoFirmado))
            }
            comprobantePago.forEach(archivo => formData.append('comprobantePago', archivo.file))
            listaInvitados.forEach(archivo => formData.append('listaInvitados', archivo.file))
            contratoFirmado.forEach(archivo => formData.append('contratoFirmado', archivo.file))

            const respuesta = await fetch(`${API_URL}/api/reservas${modoEdicion ? `/${reservaId}` : ''}`, {
                method: modoEdicion ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            })

            if (respuesta.ok) {
                mostrarToast(
                    modoEdicion ? 'Reserva actualizada' : 'Tu solicitud de reserva fue enviada correctamente',
                    'exito'
                )
                navigate('/reservas/mis-reservas')
            } else {
                const datos = await respuesta.json()
                mostrarToast(datos.error || 'No se pudo guardar la reserva', 'error')
            }
        } catch {
            mostrarToast('Error de conexión, intenta nuevamente', 'error')
        } finally {
            setEnviando(false)
        }
    }

    if (cargandoDatos) {
        return (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 text-center text-gray-500">
                Cargando reserva...
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-6">
            {observacionAdmin && (
                <div className="bg-orange-50 border border-volare-naranja/40 rounded-xl p-4 flex items-start gap-3 max-h-32 overflow-y-auto">
                    <HiOutlineExclamationTriangle size={22} className="text-volare-naranja shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                        El administrador dejó una observación en tu reserva: '{observacionAdmin}'. Por favor corrige lo indicado antes de reenviar.
                    </p>
                </div>
            )}

            <button
                type="button"
                onClick={() => navigate(rutaCalendario(espacio))}
                className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline"
            >
                <HiOutlineArrowLeft size={16} />
                Volver
            </button>

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

            {modoEdicion && (
                <p className="text-xs text-gray-500 -mt-4">
                    Para cambiar la fecha o el espacio, debes crear una nueva reserva.
                </p>
            )}

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
                        <Campo label="Manzana" value={manzana} onChange={setManzana} />
                        <Campo label="Villa" value={villa} onChange={setVilla} />
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
                        <>
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
                            {esParaTercero && (
                                <div className="flex flex-col gap-4 pt-4 border-t border-gray-200">
                                    <h3 className="text-sm font-semibold text-volare-azul">Datos del tercero/beneficiario</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Campo label="Nombre completo del tercero" value={terceroNombre} onChange={setTerceroNombre} />
                                        <Campo
                                            label="Cédula del tercero"
                                            value={terceroCedula}
                                            onChange={(v) => setTerceroCedula(v.replace(/\D/g, '').slice(0, 10))}
                                        />
                                        <Campo label="Correo del tercero" type="email" value={terceroCorreo} onChange={setTerceroCorreo} />
                                        <Campo label="Celular del tercero" value={terceroCelular} onChange={setTerceroCelular} />
                                    </div>
                                </div>
                            )}
                        </>
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
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Nombre del banco</label>
                            <SelectorBuscable
                                opciones={BANCOS_ECUADOR}
                                valor={bancoNombre}
                                onSeleccionar={setBancoNombre}
                                placeholder="Busca tu banco..."
                            />
                        </div>
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
                        <Campo label="Cédula o RUC" value={cedulaRucBancario} onChange={(v) => setCedulaRucBancario(v.replace(/\D/g, ''))} />
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
                    <div className="bg-blue-50 border border-volare-azul/20 rounded-lg p-3 flex items-start gap-2">
                        <HiOutlineExclamationTriangle size={20} className="text-volare-azul shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                            Puedes subir tus documentos ahora o más tarde desde 'Mis Reservas' → Editar. Recuerda que tu reserva no podrá aprobarse hasta que el administrador reciba todos los documentos necesarios.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {SLOTS_ARCHIVOS.map(({ slot, label }) => {
                            const [archivosNuevos, setArchivosNuevos] = archivosPorSlot[slot]
                            return (
                                <ZonaArchivosMultiple
                                    key={slot}
                                    label={label}
                                    archivosNuevos={archivosNuevos}
                                    archivosExistentes={archivosExistentes[slot]}
                                    onAgregar={crearAgregarArchivos(setArchivosNuevos, archivosNuevos)}
                                    onQuitarNuevo={crearQuitarArchivoNuevo(setArchivosNuevos, archivosNuevos)}
                                    onQuitarExistente={crearQuitarArchivoExistente(slot)}
                                />
                            )
                        })}
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
                        {aplicaTercero && (
                            <>
                                <p><span className="font-semibold">Tercero:</span> {terceroNombre} — {terceroCedula}</p>
                                <p><span className="font-semibold">Contacto del tercero:</span> {terceroCorreo} — {terceroCelular}</p>
                            </>
                        )}
                        <hr className="border-gray-200" />
                        <p><span className="font-semibold">Manzana/Villa:</span> Mz. {manzana} Villa {villa}</p>
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
                        <p><span className="font-semibold">Comprobante de pago:</span> {archivosExistentes.comprobantePago.length + comprobantePago.length} archivo(s)</p>
                        <p><span className="font-semibold">Lista de invitados:</span> {archivosExistentes.listaInvitados.length + listaInvitados.length} archivo(s)</p>
                        <p><span className="font-semibold">Contrato firmado:</span> {archivosExistentes.contratoFirmado.length + contratoFirmado.length} archivo(s)</p>
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
                        {enviando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Enviar Solicitud de Reserva'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default FormularioReserva
