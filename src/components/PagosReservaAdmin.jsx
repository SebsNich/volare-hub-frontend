import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { useToast } from '../context/ToastContext'
import { filaPagoAdmin } from '../utilities/pagos'
import ArchivoAdjunto from './ArchivoAdjunto'

const COLOR_TONO = { exito: 'text-green-700', error: 'text-red-600', aviso: 'text-yellow-700' }

const formatearFechaHora = (iso) => iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : ''

// Botones del admin para una transferencia en revisión. Rechazar pide motivo
// porque el residente lo va a leer.
// conReserva=false: pagos que no son de una reserva (alícuotas) solo se aprueban o rechazan.
export function DecisionTransferencia({ pagoId, onDecidido, conReserva = true }) {
    const { mostrarToast } = useToast()
    const [motivo, setMotivo] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function decidir(cuerpo) {
        setEnviando(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/pagos/${pagoId}/decidir`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(cuerpo)
            })
            const datos = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(datos.error || 'No se pudo guardar la decisión', 'error')
                return
            }
            mostrarToast(cuerpo.aprobarReserva ? 'Pago y reserva aprobados' : 'Decisión guardada', 'exito')
            onDecidido(cuerpo.aprobarReserva === true)
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="w-full flex flex-col gap-2 mt-1">
            <div className="flex flex-wrap gap-2">
                {conReserva && (
                    <button type="button" disabled={enviando} onClick={() => decidir({ decision: 'APROBAR', aprobarReserva: true })}
                        className="bg-volare-verde text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
                        Aprobar pago y reserva
                    </button>
                )}
                <button type="button" disabled={enviando} onClick={() => decidir({ decision: 'APROBAR' })}
                    className={conReserva
                        ? 'border border-volare-verde text-volare-verde text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-green-50 disabled:opacity-50'
                        : 'bg-volare-verde text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50'}>
                    {conReserva ? 'Aprobar solo el pago' : 'Aprobar pago'}
                </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo del rechazo"
                    className="flex-1 min-w-40 border border-gray-300 rounded-lg px-2 py-1 text-xs" />
                <button type="button" disabled={enviando || !motivo.trim()} onClick={() => decidir({ decision: 'RECHAZAR', motivo })}
                    className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
                    Rechazar transferencia
                </button>
            </div>
        </div>
    )
}

// Pagos de una reserva en el detalle del admin. Se piden al abrir el detalle,
// no en la lista: la mayoría de las reservas no se abren nunca.
// Quien lo usa le pone key={reservaId}: al cambiar de reserva se monta de nuevo
// y empieza en "Cargando", sin arrastrar los pagos de la anterior.
function PagosReservaAdmin({ reservaId, onReservaAprobada }) {
    const [pagos, setPagos] = useState(null)
    const [error, setError] = useState('')
    // Subir la versión vuelve a pedir los pagos (después de una decisión).
    const [version, setVersion] = useState(0)

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
    }, [reservaId, version])

    function alDecidir(reservaAprobada) {
        if (reservaAprobada) onReservaAprobada?.()
        else setVersion(v => v + 1)
    }

    return (
        <div className="flex flex-col gap-2">
            <p className="font-semibold text-gray-700 text-sm">Pagos en el sistema</p>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && pagos === null && <p className="text-sm text-gray-500">Cargando pagos...</p>}
            {pagos?.length === 0 && (
                <p className="text-sm text-gray-500">Sin pagos registrados. Revisa el comprobante de pago.</p>
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
                            {pago.evidenciaUrls.length > 0 && (
                                <div className="w-full flex flex-col gap-1">
                                    {pago.evidenciaUrls.map((url, i) => (
                                        <ArchivoAdjunto key={url} nombre={`Evidencia de transferencia ${i + 1}`} href={url} />
                                    ))}
                                </div>
                            )}
                            {pago.decidible && <DecisionTransferencia pagoId={pago.id} onDecidido={alDecidir} />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default PagosReservaAdmin
