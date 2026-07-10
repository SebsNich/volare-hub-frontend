import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import CalendarioDisponibilidad from '../components/CalendarioDisponibilidad'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

const HORARIOS = [
    { id: 'CASA_CLUB_MATUTINO', nombre: 'Matutino', rango: '09:00 a 13:00', monto: 80 },
    { id: 'CASA_CLUB_VESPERTINO', nombre: 'Vespertino', rango: '14:00 a 18:00', monto: 80 },
    { id: 'CASA_CLUB_NOCTURNO', nombre: 'Nocturno', rango: '19:00 a 02:00', monto: 100 }
]

function horariosParaDia(dia) {
    return getDay(dia) === 6 ? HORARIOS.filter(h => h.id !== 'CASA_CLUB_VESPERTINO') : HORARIOS
}

function formatearFecha(fecha) {
    return format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es })
}

function ReservaCasaClub() {
    const { mostrarToast } = useToast()
    const navigate = useNavigate()
    const [mesActual, setMesActual] = useState(startOfMonth(new Date()))
    const [disponibilidad, setDisponibilidad] = useState({})
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
    const [horarioSeleccionado, setHorarioSeleccionado] = useState(null)

    useEffect(() => {
        async function cargarDisponibilidad() {
            try {
                const mesParam = format(mesActual, 'yyyy-MM')
                const respuesta = await fetch(`${API_URL}/api/reservas/disponibilidad/casa-club?mes=${mesParam}`)
                if (!respuesta.ok) throw new Error('Error al cargar disponibilidad')
                const datos = await respuesta.json()
                setDisponibilidad(datos)
            } catch {
                mostrarToast('No se pudo cargar la disponibilidad de Casa Club', 'error')
            }
        }
        cargarDisponibilidad()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mesActual])

    const estadoPorDia = useMemo(() => {
        const dias = eachDayOfInterval({ start: startOfMonth(mesActual), end: endOfMonth(mesActual) })
        const resultado = {}
        dias.forEach(dia => {
            const diaSemana = getDay(dia)
            const clave = format(dia, 'yyyy-MM-dd')
            if (diaSemana === 0 || diaSemana === 1) {
                resultado[clave] = 'cerrado'
                return
            }
            const horariosDelDia = horariosParaDia(dia)
            const ocupadosDelDia = disponibilidad[clave] || []
            const ocupadosValidos = horariosDelDia.filter(h => ocupadosDelDia.includes(h.id)).length
            resultado[clave] = ocupadosValidos >= horariosDelDia.length ? 'ocupado' : 'disponible'
        })
        return resultado
    }, [disponibilidad, mesActual])

    function cambiarMes(nuevoMes) {
        setMesActual(nuevoMes)
        setFechaSeleccionada(null)
        setHorarioSeleccionado(null)
    }

    function seleccionarFecha(dia) {
        setFechaSeleccionada(dia)
        setHorarioSeleccionado(null)
    }

    const claveFechaSeleccionada = fechaSeleccionada ? format(fechaSeleccionada, 'yyyy-MM-dd') : null

    function continuar() {
        navigate('/reservas/casa-club/formulario', {
            state: { espacio: 'CASA_CLUB', fecha: claveFechaSeleccionada, horario: horarioSeleccionado }
        })
    }
    const horariosDisponiblesDia = fechaSeleccionada ? horariosParaDia(fechaSeleccionada) : []
    const horarioElegido = HORARIOS.find(h => h.id === horarioSeleccionado)
    const columnasHorarios = horariosDisponiblesDia.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-volare-azul">Reservar Casa Club</h1>

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
                        Elige un horario para el {formatearFecha(fechaSeleccionada)}
                    </h2>
                    <div className={`grid grid-cols-1 ${columnasHorarios} gap-3`}>
                        {horariosDisponiblesDia.map(horario => {
                            const ocupado = disponibilidad[claveFechaSeleccionada]?.includes(horario.id)
                            const seleccionado = horarioSeleccionado === horario.id
                            return (
                                <button
                                    key={horario.id}
                                    type="button"
                                    disabled={ocupado}
                                    onClick={() => setHorarioSeleccionado(horario.id)}
                                    className={`rounded-xl border p-4 text-left transition ${
                                        ocupado
                                            ? 'bg-red-50 border-red-100 cursor-not-allowed opacity-70'
                                            : seleccionado
                                                ? 'bg-green-50 border-2 border-volare-azul'
                                                : 'bg-green-50 border-green-100 hover:border-volare-azul cursor-pointer'
                                    }`}
                                >
                                    <p className="font-semibold text-volare-azul">{horario.nombre}</p>
                                    <p className="text-xs text-gray-500">{horario.rango}</p>
                                    <p className={`text-sm font-medium ${ocupado ? 'text-red-500' : 'text-volare-verde'}`}>
                                        {ocupado ? 'Ocupada' : 'Disponible'}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            {horarioElegido && fechaSeleccionada && (
                <div className="bg-volare-azul/5 border border-volare-azul/20 rounded-xl p-4">
                    <p className="text-gray-700">
                        <span className="font-semibold text-volare-azul">Casa Club</span>
                        {' — '}{formatearFecha(fechaSeleccionada)}{' — '}{horarioElegido.nombre} ({horarioElegido.rango}){' — '}
                        <span className="font-semibold">
                            Total: ${horarioElegido.monto * 2} (${horarioElegido.monto} alquiler + ${horarioElegido.monto} garantía)
                        </span>
                    </p>
                </div>
            )}

            <button
                type="button"
                onClick={continuar}
                disabled={!horarioSeleccionado}
                className={`self-start px-6 py-2 rounded-lg font-semibold transition ${
                    horarioSeleccionado
                        ? 'bg-volare-verde text-white hover:opacity-90 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
                Continuar
            </button>
        </div>
    )
}

export default ReservaCasaClub
