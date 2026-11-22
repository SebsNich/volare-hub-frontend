import { useState } from 'react'
import Modal from './Modal'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { nombreCompleto } from '../utilities/helpers'
import { etiquetaCasa } from '../utilities/perfil'

// Reconsiderar un rechazo: se muestra el motivo anterior para que el ADMIN
// decida sabiendo por qué se rechazó, y se pide confirmación explícita.
function AprobarCuentaRechazada({ usuario, onCerrar, onAprobada }) {
    const { mostrarToast } = useToast()
    const [enviando, setEnviando] = useState(false)
    // El error queda dentro del modal (no solo en un toast) porque, si la casa
    // está llena, el ADMIN necesita leer el mensaje con calma.
    const [error, setError] = useState('')

    async function aprobar() {
        setEnviando(true)
        setError('')
        try {
            const respuesta = await fetch(`${API_URL}/api/usuarios/${usuario.id}/aprobar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const datos = await respuesta.json().catch(() => ({}))
            if (respuesta.ok) {
                mostrarToast(`Cuenta de ${nombreCompleto(usuario)} aprobada`, 'exito')
                onAprobada()
                return
            }
            setError(datos.mensaje || 'No se pudo aprobar la cuenta')
        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <Modal onClose={() => !enviando && onCerrar()}>
            <h3 className="text-lg font-bold text-volare-azul">Aprobar cuenta rechazada</h3>
            <p className="text-sm text-gray-600">
                La solicitud de <strong>{nombreCompleto(usuario)}</strong> ({etiquetaCasa(usuario.manzana, usuario.villa)}) fue rechazada.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Motivo del rechazo</p>
                <p className="text-sm text-gray-700 break-words">{usuario.motivoRechazo || 'Sin motivo registrado'}</p>
            </div>
            <p className="text-sm text-gray-600">¿Aprobarla ahora? Podrá publicar y hacer reservas.</p>

            {error && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 self-start">
                <button
                    type="button"
                    onClick={aprobar}
                    disabled={enviando}
                    className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {enviando ? 'Aprobando...' : 'Sí, aprobar'}
                </button>
                <button
                    type="button"
                    onClick={onCerrar}
                    disabled={enviando}
                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                    {error ? 'Cerrar' : 'Cancelar'}
                </button>
            </div>
        </Modal>
    )
}

export default AprobarCuentaRechazada
