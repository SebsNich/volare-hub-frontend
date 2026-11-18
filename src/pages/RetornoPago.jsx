import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { formatearDolares } from '../utilities/tarifas'
import { leerParametrosRetorno, textoEstadoPago, mostrarBotonesSimulador } from '../utilities/pagos'

const COLOR_TONO = { exito: 'text-green-700', error: 'text-red-600', aviso: 'text-yellow-700' }
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
    if (!pago) return null

    const texto = textoEstadoPago(pago.estado)

    return (
        <div className="max-w-xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4 text-center">
                {/* El monto viene del pago guardado en el servidor. */}
                <p className="text-sm text-gray-500">Pago del alquiler: ${formatearDolares(pago.montoCentavos)}</p>

                {mostrarBotonesSimulador(pago, esSimulado) ? (
                    <>
                        <p className="text-sm text-gray-600">Proveedor simulado: elige el resultado del pago.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                type="button"
                                onClick={() => confirmar('APROBADO')}
                                disabled={confirmando}
                                className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                Simular pago aprobado
                            </button>
                            <button
                                type="button"
                                onClick={() => confirmar('RECHAZADO')}
                                disabled={confirmando}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                            >
                                Simular pago rechazado
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h1 className={`text-2xl font-bold ${COLOR_TONO[texto.tono]}`}>{texto.titulo}</h1>
                        <p className="text-sm text-gray-600">{texto.detalle}</p>
                        {pago.estado === 'PENDIENTE' && (
                            <button type="button" onClick={cargarPago} className="self-center text-sm text-volare-azul hover:underline">
                                Consultar de nuevo
                            </button>
                        )}
                    </>
                )}

                <Link to="/reservas/mis-reservas" className="self-center text-sm text-volare-azul hover:underline">
                    Ir a Mis Reservas
                </Link>
            </div>
        </div>
    )
}

export default RetornoPago
