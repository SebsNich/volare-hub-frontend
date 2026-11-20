import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
    HiOutlineArrowLeft, HiOutlineCreditCard, HiOutlineBuildingLibrary, HiOutlineShieldCheck
} from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'
import { useMetodosPago } from '../hooks/useMetodosPago'
import { API_URL } from '../config/api'
import { formatearDolares } from '../utilities/tarifas'
import {
    pagoDelAlquiler, alquilerPagado, textoEstadoPago, pasoDelPago, minutosRestantes,
    transferenciaDelAlquiler, puedeEnviarTransferencia, textoTransferencia
} from '../utilities/pagos'
import CuentasBancarias from '../components/CuentasBancarias'
import PasosPago from '../components/pagos/PasosPago'
import ResumenCobro from '../components/pagos/ResumenCobro'
import EstadoPagoPanel from '../components/pagos/EstadoPagoPanel'
import TarjetaMetodo from '../components/pagos/TarjetaMetodo'
import ZonaArchivos from '../components/pagos/ZonaArchivos'

const encabezados = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` })

async function cargarDatos(reservaId) {
    const [respReserva, respPagos] = await Promise.all([
        fetch(`${API_URL}/api/reservas/${reservaId}`, { headers: encabezados() }),
        fetch(`${API_URL}/api/pagos?reservaId=${encodeURIComponent(reservaId)}`, { headers: encabezados() })
    ])
    if (!respReserva.ok || !respPagos.ok) throw new Error('No se pudo cargar la reserva')
    const reserva = await respReserva.json()
    const { pagos } = await respPagos.json()
    return { reserva, pagos }
}

function PagarReserva() {
    const { id } = useParams()
    const { mostrarToast } = useToast()
    const { metodos } = useMetodosPago()
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [archivos, setArchivos] = useState([])
    const [enviandoTransferencia, setEnviandoTransferencia] = useState(false)
    const [ahora, setAhora] = useState(() => Date.now())

    useEffect(() => {
        cargarDatos(id)
            .then(setDatos)
            .catch(() => setError('No se pudo cargar la reserva'))
    }, [id])

    // La cuenta regresiva solo informa; quien vence la reserva es el servidor.
    useEffect(() => {
        const intervalo = setInterval(() => setAhora(Date.now()), 15000)
        return () => clearInterval(intervalo)
    }, [])

    async function enviarTransferencia() {
        if (archivos.length === 0) {
            mostrarToast('Adjunta el comprobante de la transferencia', 'error')
            return
        }
        setEnviandoTransferencia(true)
        try {
            // Sin Content-Type: el navegador lo arma con el separador del multipart.
            const formulario = new FormData()
            formulario.append('reservaId', id)
            formulario.append('concepto', 'ALQUILER')
            archivos.forEach(archivo => formulario.append('evidencia', archivo))
            const respuesta = await fetch(`${API_URL}/api/pagos/transferencia`, { method: 'POST', headers: encabezados(), body: formulario })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(cuerpo.error || 'No se pudo enviar la transferencia', 'error')
                return
            }
            mostrarToast('Comprobante enviado. La administración lo revisará.', 'exito')
            setArchivos([])
            setDatos(await cargarDatos(id))
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setEnviandoTransferencia(false)
        }
    }

    async function pagar() {
        setEnviando(true)
        try {
            // Solo se envía qué se paga y con qué proveedor informó el servidor. El monto lo pone el servidor.
            const respuesta = await fetch(`${API_URL}/api/pagos`, {
                method: 'POST',
                headers: { ...encabezados(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservaId: id, concepto: 'ALQUILER', proveedor: metodos.enLinea.proveedor })
            })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(cuerpo.error || 'No se pudo iniciar el pago', 'error')
                setEnviando(false)
                return
            }
            // Navegación completa, como hará un proveedor real que lleva a su propia página.
            window.location.assign(cuerpo.url)
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
            setEnviando(false)
        }
    }

    if (error) {
        return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-600">{error}</div>
    }
    if (!datos) {
        return <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-400">Preparando tu pago…</div>
    }

    const { reserva, pagos } = datos
    const pagado = alquilerPagado(pagos)
    const ultimoPago = pagoDelAlquiler(pagos)
    const transferencia = transferenciaDelAlquiler(pagos)
    const transferenciaEnRevision = transferencia?.estado === 'PENDIENTE'
    const pendiente = reserva.estado === 'PENDIENTE'
    const puedeElegirMetodo = pendiente && !pagado && !transferenciaEnRevision
    const minutos = puedeElegirMetodo && metodos.enLinea.disponible
        ? minutosRestantes(reserva.creadoEn, metodos.enLinea.vigenciaMinutos, ahora)
        : null

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
            <Link to="/reservas/mis-reservas" className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline">
                <HiOutlineArrowLeft size={16} />
                Mis Reservas
            </Link>

            <header className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-800">Completar <span className="texto-degradado">pago</span></h1>
                <p className="text-sm text-gray-500">Elige cómo pagar el alquiler. Tu reserva se confirma cuando la administración la revisa.</p>
            </header>

            <PasosPago paso={pasoDelPago(reserva, pagos)} />

            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
                <ResumenCobro reserva={reserva} minutos={minutos} />

                <div className="flex flex-col gap-5">
                    {pagado && (
                        <EstadoPagoPanel
                            tono="exito"
                            titulo="Alquiler pagado"
                            monto={`$${formatearDolares(ultimoPago.montoCentavos)}`}
                            detalle="Recibimos tu pago. La administración revisará tu reserva y verás el resultado en Mis Reservas."
                        >
                            <Link to="/reservas/mis-reservas" className="bg-volare-azul text-white px-5 py-2 rounded-lg font-semibold">Ir a Mis Reservas</Link>
                        </EstadoPagoPanel>
                    )}

                    {!pagado && transferenciaEnRevision && (
                        <EstadoPagoPanel tono="aviso" titulo="Comprobante en revisión" detalle={textoTransferencia(transferencia)}>
                            <Link to="/reservas/mis-reservas" className="bg-volare-azul text-white px-5 py-2 rounded-lg font-semibold">Ir a Mis Reservas</Link>
                        </EstadoPagoPanel>
                    )}

                    {!pagado && transferencia?.estado === 'RECHAZADO' && (
                        <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{textoTransferencia(transferencia)}</p>
                    )}

                    {/* La transferencia ya tiene su propio texto arriba. */}
                    {!pagado && ultimoPago && ultimoPago !== transferencia && (
                        <p className="text-sm text-gray-500">Último intento de pago en línea: {textoEstadoPago(ultimoPago.estado).titulo}</p>
                    )}

                    {!pagado && !pendiente && (
                        <p className="tarjeta-pro p-6 text-sm text-gray-600">Esta reserva ya no está pendiente: no se puede pagar.</p>
                    )}

                    {puedeElegirMetodo && metodos.enLinea.disponible && (
                        <TarjetaMetodo
                            icono={HiOutlineCreditCard}
                            titulo="Pagar en línea"
                            descripcion="Pago inmediato con tarjeta o la pasarela de pago."
                            etiqueta={metodos.enLinea.esSimulacion ? 'Modo demostración' : null}
                        >
                            <button
                                type="button"
                                onClick={pagar}
                                disabled={enviando || minutos === 0}
                                className="bg-volare-verde text-white px-5 py-3 rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-50"
                            >
                                {enviando ? 'Iniciando pago…' : minutos === 0 ? 'Plazo terminado: paga por transferencia' : `Pagar $${Number(reserva.montoAlquiler)}`}
                            </button>
                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                                <HiOutlineShieldCheck size={16} className="text-volare-verde shrink-0" />
                                {metodos.enLinea.esSimulacion
                                    ? 'Es una simulación: no se cobra dinero real.'
                                    : 'El monto lo calcula el servidor, no tu navegador.'}
                            </p>
                        </TarjetaMetodo>
                    )}

                    {metodos.transferencia.disponible && puedeEnviarTransferencia(reserva, pagos) && (
                        <TarjetaMetodo
                            icono={HiOutlineBuildingLibrary}
                            titulo="Pagar por transferencia"
                            descripcion={`Transfiere $${Number(reserva.montoAlquiler)} a una de las cuentas y adjunta el comprobante.`}
                        >
                            <CuentasBancarias />
                            <ZonaArchivos archivos={archivos} alCambiar={setArchivos} />
                            <button
                                type="button"
                                onClick={enviarTransferencia}
                                disabled={enviandoTransferencia || archivos.length === 0}
                                className="bg-volare-azul text-white px-5 py-3 rounded-xl font-bold text-base hover:opacity-90 transition disabled:opacity-50"
                            >
                                {enviandoTransferencia ? 'Enviando…' : 'Enviar comprobante'}
                            </button>
                        </TarjetaMetodo>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PagarReserva
