import { useState, useEffect } from 'react'
import { HiOutlineCheck, HiOutlineXMark, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { nombreCompleto } from '../utilities/helpers'

// RF-08: el administrador revisa las solicitudes de registro pendientes y las aprueba o rechaza.
function SolicitudesRegistro({ onCambio }) {
    const { mostrarToast } = useToast()
    const [solicitudes, setSolicitudes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [procesando, setProcesando] = useState(null)

    async function cargarSolicitudes() {
        setCargando(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/admin/registros`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            if (respuesta.ok) {
                setSolicitudes(await respuesta.json())
            } else {
                mostrarToast('No se pudieron cargar las solicitudes', 'error')
            }
        } catch {
            mostrarToast('No se pudieron cargar las solicitudes', 'error')
        }
        setCargando(false)
    }

    useEffect(() => {
        cargarSolicitudes()
    }, [])

    async function resolver(id, decision) {
        setProcesando(id)
        try {
            const respuesta = await fetch(`${API_URL}/api/admin/registros/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ decision })
            })
            if (respuesta.ok) {
                mostrarToast(decision === 'APROBAR' ? 'Solicitud aprobada' : 'Solicitud rechazada', 'exito')
                setSolicitudes(actuales => actuales.filter(s => s.id !== id))
                if (onCambio) onCambio()
            } else {
                const datos = await respuesta.json().catch(() => ({}))
                mostrarToast(datos.error || 'No se pudo resolver la solicitud', 'error')
            }
        } catch {
            mostrarToast('No se pudo resolver la solicitud', 'error')
        }
        setProcesando(null)
    }

    if (cargando) {
        return <p className="text-sm text-gray-500">Cargando solicitudes…</p>
    }

    if (solicitudes.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center text-gray-500">
                No hay solicitudes de registro pendientes.
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {solicitudes.map(s => (
                <div key={s.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-800">{nombreCompleto(s) || s.email}</span>
                            {s.revisionPadron && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-volare-naranja bg-orange-50 rounded-full px-2 py-0.5">
                                    <HiOutlineExclamationTriangle size={14} />
                                    No coincide con el padrón
                                </span>
                            )}
                        </div>
                        <span className="text-sm text-gray-500 break-words">{s.email}</span>
                        <span className="text-sm text-gray-500">
                            Cédula {s.cedula || '—'} · Manzana {s.manzana || '—'}, Villa {s.villa || '—'} · Cel. {s.celular || '—'}
                        </span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => resolver(s.id, 'APROBAR')}
                            disabled={procesando === s.id}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-volare-verde text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            <HiOutlineCheck size={18} />
                            Aprobar
                        </button>
                        <button
                            onClick={() => resolver(s.id, 'RECHAZAR')}
                            disabled={procesando === s.id}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                        >
                            <HiOutlineXMark size={18} />
                            Rechazar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default SolicitudesRegistro
