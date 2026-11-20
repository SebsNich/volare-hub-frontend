import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    HiOutlineArrowLeft, HiOutlineCreditCard, HiOutlineBuildingLibrary, HiOutlineSparkles, HiOutlineShieldCheck
} from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'
import { useMetodosPago } from '../hooks/useMetodosPago'
import { API_URL } from '../config/api'
import { formatearDolares } from '../utilities/tarifas'
import { nombrePeriodo, resumenCobro, estadoCuota } from '../utilities/alicuotas'
import CuentasBancarias from '../components/CuentasBancarias'
import TarjetaMetodo from '../components/pagos/TarjetaMetodo'
import ZonaArchivos from '../components/pagos/ZonaArchivos'

const encabezados = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` })
const COLOR_TONO = { exito: 'bg-green-100 text-green-800', aviso: 'bg-yellow-100 text-yellow-800', neutro: 'bg-gray-100 text-gray-600' }

async function cargarCuotas() {
    const respuesta = await fetch(`${API_URL}/api/alicuotas/mias`, { headers: encabezados() })
    const cuerpo = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) throw new Error(cuerpo.error || 'No se pudieron cargar tus alícuotas')
    return cuerpo
}

function Etiqueta({ cuota }) {
    const { texto, tono } = estadoCuota(cuota)
    return <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${COLOR_TONO[tono]}`}>{texto}</span>
}

// Una cuota pendiente: qué se paga hoy (lo dice el servidor) y las dos formas de pagar.
function CuotaPendiente({ cuota, metodos, alActualizar }) {
    const { mostrarToast } = useToast()
    const [conTransferencia, setConTransferencia] = useState(false)
    const [archivos, setArchivos] = useState([])
    const [enviando, setEnviando] = useState(false)
    const cobro = resumenCobro(cuota)
    const enRevision = cuota.transferenciaEnRevision

    async function pagarEnLinea() {
        setEnviando(true)
        try {
            // Solo se envía qué cuota y con qué proveedor informó el servidor; el monto lo pone el servidor.
            const respuesta = await fetch(`${API_URL}/api/alicuotas/pagar`, {
                method: 'POST',
                headers: { ...encabezados(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ cuotaId: cuota.id, proveedor: metodos.enLinea.proveedor })
            })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(cuerpo.error || 'No se pudo iniciar el pago', 'error')
                setEnviando(false)
                return
            }
            window.location.assign(cuerpo.url)
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
            setEnviando(false)
        }
    }

    async function enviarTransferencia() {
        setEnviando(true)
        try {
            const formulario = new FormData()
            formulario.append('cuotaId', cuota.id)
            archivos.forEach(archivo => formulario.append('evidencia', archivo))
            const respuesta = await fetch(`${API_URL}/api/alicuotas/transferencia`, { method: 'POST', headers: encabezados(), body: formulario })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(cuerpo.error || 'No se pudo enviar la transferencia', 'error')
                return
            }
            mostrarToast('Comprobante enviado. La administración lo revisará.', 'exito')
            setArchivos([])
            setConTransferencia(false)
            alActualizar()
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <section className="tarjeta-brillo p-6 flex flex-col gap-5 aparecer">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-widest text-gray-500">Alícuota</p>
                    <h2 className="text-2xl font-bold text-gray-800 font-[family-name:var(--font-display)]">{nombrePeriodo(cuota.periodo)}</h2>
                </div>
                <Etiqueta cuota={cuota} />
            </header>

            <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                <div>
                    <p className="text-sm text-gray-500">A pagar hoy</p>
                    <p className="text-5xl font-extrabold texto-degradado font-[family-name:var(--font-display)]">${formatearDolares(cobro.pagarHoyCentavos)}</p>
                </div>
                {cuota.aplicaDescuento ? (
                    <p className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-3 py-2">
                        <HiOutlineSparkles size={18} className="shrink-0" />
                        <span>Pago puntual: ahorras ${formatearDolares(cobro.ahorroCentavos)} sobre ${formatearDolares(cuota.montoBaseCentavos)}. {cobro.mensaje}</span>
                    </p>
                ) : (
                    <p className="text-sm text-gray-500">Valor fijo de ${formatearDolares(cuota.montoBaseCentavos)}. {cobro.mensaje}</p>
                )}
            </div>

            {cuota.ultimoRechazo && (
                <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                    Tu última transferencia fue rechazada: {cuota.ultimoRechazo}
                </p>
            )}

            {enRevision ? (
                <p className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3">
                    Enviaste tu comprobante. La administración lo está revisando; verás aquí el resultado.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    {metodos.enLinea.disponible && (
                        <TarjetaMetodo
                            icono={HiOutlineCreditCard}
                            titulo="Pagar en línea"
                            descripcion="Pago inmediato con tarjeta o la pasarela de pago."
                            etiqueta={metodos.enLinea.esSimulacion ? 'Modo demostración' : null}
                        >
                            <button
                                type="button"
                                onClick={pagarEnLinea}
                                disabled={enviando}
                                className="bg-volare-verde text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                            >
                                {enviando ? 'Iniciando pago…' : `Pagar $${formatearDolares(cobro.pagarHoyCentavos)}`}
                            </button>
                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                <HiOutlineShieldCheck size={16} className="text-volare-verde shrink-0" />
                                {metodos.enLinea.esSimulacion ? 'Es una simulación: no se cobra dinero real.' : 'El monto lo calcula el servidor, no tu navegador.'}
                            </p>
                        </TarjetaMetodo>
                    )}
                    {metodos.transferencia.disponible && (
                        <TarjetaMetodo
                            icono={HiOutlineBuildingLibrary}
                            titulo="Pagar por transferencia"
                            descripcion={`Transfiere $${formatearDolares(cobro.pagarHoyCentavos)} a una de las cuentas y adjunta el comprobante.`}
                        >
                            {!conTransferencia ? (
                                <button type="button" onClick={() => setConTransferencia(true)} className="self-start border border-volare-azul text-volare-azul px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition">
                                    Ver cuentas y subir comprobante
                                </button>
                            ) : (
                                <>
                                    <CuentasBancarias />
                                    <ZonaArchivos archivos={archivos} alCambiar={setArchivos} />
                                    <button
                                        type="button"
                                        onClick={enviarTransferencia}
                                        disabled={enviando || archivos.length === 0}
                                        className="bg-volare-azul text-white px-5 py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                                    >
                                        {enviando ? 'Enviando…' : 'Enviar comprobante'}
                                    </button>
                                </>
                            )}
                        </TarjetaMetodo>
                    )}
                </div>
            )}
        </section>
    )
}

function Alicuotas() {
    const { metodos } = useMetodosPago()
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState('')

    const recargar = useCallback(() => {
        cargarCuotas().then(setDatos).catch((falla) => setError(falla.message))
    }, [])

    useEffect(() => { recargar() }, [recargar])

    if (error) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-600">{error}</div>
    if (!datos) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Cargando tus alícuotas…</div>

    const { villa, config, cuotas } = datos
    const pendientes = cuotas.filter(c => c.estado === 'PENDIENTE')
    const historial = cuotas.filter(c => c.estado !== 'PENDIENTE')

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
            <Link to="/feed" className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline">
                <HiOutlineArrowLeft size={16} />
                Inicio
            </Link>

            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-800">Mis <span className="texto-degradado">alícuotas</span></h1>
                <p className="text-sm text-gray-500">
                    Manzana {villa.manzana} · Villa {villa.villa}. La alícuota es un valor fijo de ${formatearDolares(config.montoCentavos)} al mes;
                    si la pagas en los primeros {config.diasPuntual} días del mes cuesta ${formatearDolares(config.montoPuntualCentavos)}.
                </p>
            </header>

            {pendientes.length === 0 && (
                <p className="tarjeta-pro p-6 text-sm text-gray-600">Estás al día: no tienes alícuotas pendientes.</p>
            )}
            {pendientes.map(cuota => (
                <CuotaPendiente key={cuota.id} cuota={cuota} metodos={metodos} alActualizar={recargar} />
            ))}

            {historial.length > 0 && (
                <section className="tarjeta-pro p-6 flex flex-col gap-3">
                    <h2 className="text-lg font-bold text-gray-800">Historial</h2>
                    <ul className="flex flex-col divide-y divide-gray-100">
                        {historial.map(cuota => (
                            <li key={cuota.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                                <span className="font-semibold text-gray-700">{nombrePeriodo(cuota.periodo)}</span>
                                <span className="text-gray-500">
                                    {cuota.pagado ? `$${formatearDolares(cuota.pagado.montoCentavos)}` : ''}
                                </span>
                                <Etiqueta cuota={cuota} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    )
}

export default Alicuotas
