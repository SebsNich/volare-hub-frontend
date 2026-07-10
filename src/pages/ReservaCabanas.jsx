import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const CABANAS = [
    { id: 'CABANA_ARBOL', nombre: 'Árbol' },
    { id: 'CABANA_MEDIO', nombre: 'Medio' },
    { id: 'CABANA_RIO', nombre: 'Río' }
]

function nombreCabana(id) {
    return CABANAS.find(c => c.id === id)?.nombre ?? ''
}

function formatearFecha(fecha) {
    return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })
}

function ReservaCabanas() {
    const { mostrarToast } = useToast()
    const navigate = useNavigate()
    const [mesActual, setMesActual] = useState(startOfMonth(new Date()))
    const [disponibilidad, setDisponibilidad] = useState({ CABANA_ARBOL: [], CABANA_MEDIO: [], CABANA_RIO: [] })
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
    const [cabanaSeleccionada, setCabanaSeleccionada] = useState(null)

    useEffect(() => {
        async function cargarDisponibilidad() {
            try {
                const mesParam = format(mesActual, 'yyyy-MM')
                const respuesta = await fetch(`${API_URL}/api/reservas/disponibilidad/cabanas?mes=${mesParam}`)
                if (!respuesta.ok) throw new Error('Error al cargar disponibilidad')
                const datos = await respuesta.json()
                setDisponibilidad(datos)
            } catch {
                mostrarToast('No se pudo cargar la disponibilidad de cabañas', 'error')
            }
        }
        cargarDisponibilidad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesActual])

    const estadoPorDia = useMemo(() => {
        const dias = eachDayOfInterval({ start: startOfMonth(mesActual), end: endOfMonth(mesActual) })
        const resultado = {}
        dias.forEach(dia => {
            const clave = format(dia, 'yyyy-MM-dd')
            if (getDay(dia) === 1) {
                resultado[clave] = 'cerrado'
                return
            }
            const cabanasOcupadas = CABANAS.filter(c => disponibilidad[c.id]?.includes(clave)).length
            resultado[clave] = cabanasOcupadas >= CABANAS.length ? 'ocupado' : 'disponible'
        })
        return resultado
    }, [disponibilidad, mesActual])

    function cambiarMes(nuevoMes) {
        setMesActual(nuevoMes)
        setFechaSeleccionada(null)
        setCabanaSeleccionada(null)
    }

    function seleccionarFecha(dia) {
        setFechaSeleccionada(dia)
        setCabanaSeleccionada(null)
    }

    const claveFechaSeleccionada = fechaSeleccionada ? format(fechaSeleccionada, 'yyyy-MM-dd') : null

    function continuar() {
        navigate('/reservas/cabanas/formulario', {
            state: { espacio: cabanaSeleccionada, fecha: claveFechaSeleccionada, horario: 'CABANA_COMPLETO' }
        })
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            <Link to="/reservas" className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline">
                <HiOutlineArrowLeft size={16} />
                Volver
            </Link>

            <h1 className="text-2xl font-bold text-volare-azul">Reservar Cabaña</h1>

            <CalendarioDisponibilidad
                mesActual={mesActual}
                onCambiarMes={cambiarMes}
                estadoPorDia={estadoPorDia}
                onSeleccionarFecha={seleccionarFecha}
                fechaSeleccionada={fechaSeleccionada}
            />

            {fechaSeleccionada && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-3">
                    <h2 className="text-sm font-semibold text-gray-500">
                        Elige una cabaña para el {formatearFecha(fechaSeleccionada)}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {CABANAS.map(cabana => {
                            const ocupada = disponibilidad[cabana.id]?.includes(claveFechaSeleccionada)
                            const seleccionada = cabanaSeleccionada === cabana.id
                            return (
                                <button
                                    key={cabana.id}
                                    type="button"
                                    disabled={ocupada}
                                    onClick={() => setCabanaSeleccionada(cabana.id)}
                                    className={`rounded-xl border p-4 text-left transition ${
                                        ocupada
                                            ? 'bg-red-50 border-red-100 cursor-not-allowed opacity-70'
                                            : seleccionada
                                                ? 'bg-green-50 border-2 border-volare-azul'
                                                : 'bg-green-50 border-green-100 hover:border-volare-azul cursor-pointer'
                                    }`}
                                >
                                    <p className="font-semibold text-volare-azul">Cabaña {cabana.nombre}</p>
                                    <p className={`text-sm font-medium ${ocupada ? 'text-red-500' : 'text-volare-verde'}`}>
                                        {ocupada ? 'Ocupada' : 'Disponible'}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {cabanaSeleccionada && fechaSeleccionada && (
                <div className="bg-volare-azul/5 border border-volare-azul/20 rounded-xl p-4">
                    <p className="text-gray-700">
                        <span className="font-semibold text-volare-azul">Cabaña {nombreCabana(cabanaSeleccionada)}</span>
                        {' — '}{formatearFecha(fechaSeleccionada)}{' — '}10:00 a 18:00{' — '}
                        <span className="font-semibold">Total: $40 ($15 alquiler + $25 garantía)</span>
                    </p>
                </div>
            )}

            <button
                type="button"
                onClick={continuar}
                disabled={!cabanaSeleccionada}
                className={`self-start px-6 py-2 rounded-lg font-semibold transition ${
                    cabanaSeleccionada
                        ? 'bg-volare-verde text-white hover:opacity-90 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                Continuar
            </button>
        </div>
    )
}

export default ReservaCabanas
