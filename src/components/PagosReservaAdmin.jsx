import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { filaPagoAdmin } from '../utilities/pagos'

const COLOR_TONO = { exito: 'text-green-700', error: 'text-red-600', aviso: 'text-yellow-700' }

const formatearFechaHora = (iso) => iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : ''

// Pagos de una reserva en el detalle del admin. Se piden al abrir el detalle,
// no en la lista: la mayoría de las reservas no se abren nunca.
// Quien lo usa le pone key={reservaId}: al cambiar de reserva se monta de nuevo
// y empieza en "Cargando", sin arrastrar los pagos de la anterior.
function PagosReservaAdmin({ reservaId }) {
    const [pagos, setPagos] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let vigente = true
        fetch(`${API_URL}/api/pagos?reservaId=${encodeURIComponent(reservaId)}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(async (respuesta) => {
                if (!respuesta.ok) throw new Error('No se pudieron cargar los pagos')
                const datos = await respuesta.json()
                // Si el admin ya abrió otra reserva, esta respuesta llegó tarde y se ignora.
                if (vigente) setPagos(datos.pagos.map(filaPagoAdmin))
            })
            .catch((falla) => { if (vigente) setError(falla.message) })
        return () => { vigente = false }
    }, [reservaId])

    return (
        <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700 text-sm">Pagos en el sistema</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && pagos === null && <p className="text-sm text-gray-500">Cargando pagos...</p>}
            {pagos?.length === 0 && (
                <p className="text-sm text-gray-500">Sin pagos en línea. Revisa el comprobante de pago.</p>
            )}
            {pagos?.length > 0 && (
                <ul className="flex flex-col gap-1 text-sm">
                    {pagos.map(pago => (
                        <li key={pago.id} className="bg-gray-50 rounded-lg px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 items-center">
                            <span className="font-semibold">{pago.concepto}</span>
                            <span>{pago.monto}</span>
                            <span className="text-gray-600">{pago.proveedor}</span>
                            <span className={`font-semibold ${COLOR_TONO[pago.tono] ?? ''}`}>{pago.estado}</span>
                            <span className="text-gray-500 text-xs">{formatearFechaHora(pago.creadoEn)}</span>
                            {pago.motivo && <span className="w-full text-xs text-gray-500">Motivo: {pago.motivo}</span>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default PagosReservaAdmin
