import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { PROVEEDOR_PAGO_EN_LINEA } from '../config/pagos'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA } from '../utilities/constantes'
import { formatearFechaReserva } from '../utilities/helpers'
import { formatearDolares } from '../utilities/tarifas'
import { pagoDelAlquiler, alquilerPagado, textoEstadoPago } from '../utilities/pagos'

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
    const [datos, setDatos] = useState(null)
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)

    useEffect(() => {
        cargarDatos(id)
            .then(setDatos)
            .catch(() => setError('No se pudo cargar la reserva'))
    }, [id])

    async function pagar() {
        setEnviando(true)
        try {
            // Solo se envía qué se paga. El monto lo pone el servidor desde la reserva.
            const respuesta = await fetch(`${API_URL}/api/pagos`, {
                method: 'POST',
                headers: { ...encabezados(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reservaId: id, concepto: 'ALQUILER', proveedor: PROVEEDOR_PAGO_EN_LINEA })
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
    if (!datos) return null

    const { reserva, pagos } = datos
    const pagado = alquilerPagado(pagos)
    const ultimoPago = pagoDelAlquiler(pagos)

    return (
        <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
            <Link to="/reservas/mis-reservas" className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline">
                <HiOutlineArrowLeft size={16} />
                Mis Reservas
            </Link>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                <h1 className="text-xl font-bold text-volare-azul">Pagar alquiler</h1>
                <div className="text-sm text-gray-600 flex flex-col gap-1">
                    <p className="font-semibold text-gray-700">{NOMBRES_ESPACIO_RESERVA[reserva.espacio]}</p>
                    <p>{formatearFechaReserva(reserva.fecha)} — {NOMBRES_HORARIO_RESERVA[reserva.horario]}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex flex-col gap-1">
                    {/* Montos tal como los guardó el servidor en la reserva. */}
                    <p className="font-bold text-volare-azul">Alquiler en línea: ${Number(reserva.montoAlquiler)}</p>
                    <p className="text-gray-500">Garantía: ${Number(reserva.montoGarantia)} (por transferencia, no se cobra aquí)</p>
                </div>

                {pagado && (
                    <p className="text-sm font-semibold text-green-700">
                        Alquiler pagado: ${formatearDolares(ultimoPago.montoCentavos)}
                    </p>
                )}

                {!pagado && ultimoPago && (
                    <p className="text-sm text-gray-500">Último intento: {textoEstadoPago(ultimoPago.estado).titulo}</p>
                )}

                {!pagado && reserva.estado === 'PENDIENTE' && (
                    <button
                        type="button"
                        onClick={pagar}
                        disabled={enviando}
                        className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                        {enviando ? 'Iniciando pago…' : 'Pagar'}
                    </button>
                )}

                {!pagado && reserva.estado !== 'PENDIENTE' && (
                    <p className="text-sm text-gray-500">Esta reserva ya no está pendiente: no se puede pagar.</p>
                )}
            </div>
        </div>
    )
}

export default PagarReserva
