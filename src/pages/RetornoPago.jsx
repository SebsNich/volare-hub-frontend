import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiOutlineBeaker } from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { formatearDolares } from '../utilities/tarifas'
import { leerParametrosRetorno, textoEstadoPago, mostrarBotonesSimulador } from '../utilities/pagos'
import EstadoPagoPanel from '../components/pagos/EstadoPagoPanel'

const encabezados = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}` })

async function pedirPago(pagoId) {
    const respuesta = await fetch(`${API_URL}/api/pagos/${encodeURIComponent(pagoId)}`, { headers: encabezados() })
    const cuerpo = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) throw new Error(cuerpo.error || 'No se pudo cargar el pago')
    return cuerpo.pago
}

// Página a la que vuelve el residente después de pagar (/pagos/retorno?pago=…).
// Con el simulado, aquí se elige el resultado; con un proveedor real, la
// confirmación llegará con los datos de su redirección.
function RetornoPago() {
    const { search } = useLocation()
    const { pagoId, esSimulado } = leerParametrosRetorno(search)
    const { mostrarToast } = useToast()
    const [pago, setPago] = useState(null)
    const [errorCarga, setErrorCarga] = useState('')
    const [confirmando, setConfirmando] = useState(false)
    const error = pagoId ? errorCarga : 'Falta el identificador del pago'

    function cargarPago() {
        pedirPago(pagoId)
            .then(setPago)
            .catch((falla) => setErrorCarga(falla.message || 'No se pudo conectar con el servidor'))
    }

    useEffect(() => {
        if (!pagoId) return
        pedirPago(pagoId)
            .then(setPago)
            .catch((falla) => setErrorCarga(falla.message || 'No se pudo conectar con el servidor'))
    }, [pagoId])

    async function confirmar(resultado) {
        setConfirmando(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/pagos/${encodeURIComponent(pagoId)}/confirmar`, {
                method: 'POST',
                headers: { ...encabezados(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultado })
            })
            const cuerpo = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                mostrarToast(cuerpo.error || 'No se pudo confirmar el pago', 'error')
                return
            }
            setPago(cuerpo.pago)
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setConfirmando(false)
        }
    }

    if (error) {
        return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-600">{error}</div>
    }
    if (!pago) return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-400">Consultando tu pago…</div>

    const texto = textoEstadoPago(pago.estado)
    // El monto viene del pago guardado en el servidor.
    const monto = `Alquiler · $${formatearDolares(pago.montoCentavos)}`

    return (
        <div className="max-w-xl mx-auto px-4 py-10 flex flex-col gap-5">
            {mostrarBotonesSimulador(pago, esSimulado) ? (
                <section className="tarjeta-brillo p-8 flex flex-col items-center text-center gap-5 aparecer">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        <HiOutlineBeaker size={14} /> Pasarela de demostración
                    </span>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-500">Total a pagar</p>
                        <p className="text-5xl font-extrabold texto-degradado font-[family-name:var(--font-display)]">${formatearDolares(pago.montoCentavos)}</p>
                    </div>
                    <p className="text-sm text-gray-600 max-w-sm">Aquí iría la página del proveedor de pago. Elige el resultado para probar el flujo; no se cobra dinero real.</p>
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => confirmar('APROBADO')}
                            disabled={confirmando}
                            className="flex-1 bg-volare-verde text-white px-4 py-3 rounded-xl font-bold hover:opacity-90 transition disabled:opacity-50"
                        >
                            Simular pago aprobado
                        </button>
                        <button
                            type="button"
                            onClick={() => confirmar('RECHAZADO')}
                            disabled={confirmando}
                            className="flex-1 border border-red-300 text-red-600 px-4 py-3 rounded-xl font-bold hover:bg-red-50 transition disabled:opacity-50"
                        >
                            Simular pago rechazado
                        </button>
                    </div>
                </section>
            ) : (
                <EstadoPagoPanel tono={texto.tono} titulo={texto.titulo} detalle={texto.detalle} monto={monto}>
                    {pago.estado === 'PENDIENTE' && (
                        <button type="button" onClick={cargarPago} className="text-sm text-volare-azul font-semibold hover:underline">
                            Consultar de nuevo
                        </button>
                    )}
                </EstadoPagoPanel>
            )}

            <Link to="/reservas/mis-reservas" className="self-center text-sm text-volare-azul font-semibold hover:underline">
                Ir a Mis Reservas
            </Link>
        </div>
    )
}

export default RetornoPago
