import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA } from '../utilities/constantes'
import { formatearFechaReserva } from '../utilities/helpers'

function MisReservas() {
    const { mostrarToast } = useToast()
    const [reservas, setReservas] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        async function cargarReservas() {
            try {
                const respuesta = await fetch(`${API_URL}/api/reservas/mias`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (!respuesta.ok) throw new Error('Error al cargar reservas')
                const datos = await respuesta.json()
                setReservas(datos)
            } catch {
                mostrarToast('No se pudieron cargar tus reservas', 'error')
            } finally {
                setCargando(false)
            }
        }
        cargarReservas()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const reservasOrdenadas = [...reservas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-volare-azul">Mis Reservas</h1>

            {!cargando && reservasOrdenadas.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center gap-3">
                    <p className="text-gray-600">Aún no has hecho ninguna reserva</p>
                    <Link
                        to="/reservas"
                        className="bg-volare-azul text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Reservar un espacio
                    </Link>
                </div>
            )}

            <div className="flex flex-col gap-4">
                {reservasOrdenadas.map(reserva => {
                    const estilo = ESTILOS_ESTADO_RESERVA[reserva.estado]
                    const total = Number(reserva.montoAlquiler) + Number(reserva.montoGarantia)
                    return (
                        <div key={reserva.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold text-volare-azul">{NOMBRES_ESPACIO_RESERVA[reserva.espacio]}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatearFechaReserva(reserva.fecha)} — {NOMBRES_HORARIO_RESERVA[reserva.horario]}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold shrink-0 ${estilo.color}`}>
                                    <span className={`w-2 h-2 rounded-full ${estilo.punto}`} />
                                    {estilo.label}
                                </span>
                            </div>
                            {reserva.estado === 'RECHAZADA' && reserva.motivoRechazo && (
                                <p className="text-xs text-gray-500">Motivo: {reserva.motivoRechazo}</p>
                            )}
                            <p className="text-sm font-semibold text-gray-700">Total: ${total}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default MisReservas
