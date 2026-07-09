import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addMonths,
    format,
    isSameMonth,
    isSameDay,
    isBefore,
    isAfter,
    startOfToday
} from 'date-fns'
import { es } from 'date-fns/locale'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function CalendarioDisponibilidad({ mesActual, onCambiarMes, estadoPorDia, onSeleccionarFecha, fechaSeleccionada }) {
    const hoy = startOfToday()
    const mesActualReal = startOfMonth(hoy)
    const mesLimite = addMonths(mesActualReal, 3)

    const puedeRetroceder = isAfter(startOfMonth(mesActual), mesActualReal)
    const puedeAvanzar = isBefore(startOfMonth(mesActual), mesLimite)

    const inicioGrid = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 0 })
    const finGrid = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 0 })
    const dias = eachDayOfInterval({ start: inicioGrid, end: finGrid })

    const tituloMes = format(mesActual, 'MMMM yyyy', { locale: es })
    const tituloCapitalizado = tituloMes.charAt(0).toUpperCase() + tituloMes.slice(1)

    function manejarAnterior() {
        if (!puedeRetroceder) return
        onCambiarMes(addMonths(mesActual, -1))
    }

    function manejarSiguiente() {
        if (!puedeAvanzar) return
        onCambiarMes(addMonths(mesActual, 1))
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={manejarAnterior}
                    disabled={!puedeRetroceder}
                    aria-label="Mes anterior"
                    className={`text-xl font-bold px-2 transition ${puedeRetroceder ? 'text-volare-azul hover:opacity-70 cursor-pointer' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                >
                    ‹
                </button>
                <h3 className="text-lg font-semibold text-volare-azul">{tituloCapitalizado}</h3>
                <button
                    type="button"
                    onClick={manejarSiguiente}
                    disabled={!puedeAvanzar}
                    aria-label="Mes siguiente"
                    className={`text-xl font-bold px-2 transition ${puedeAvanzar ? 'text-volare-azul hover:opacity-70 cursor-pointer' : 'text-gray-300 cursor-not-allowed opacity-50'}`}
                >
                    ›
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(dia => (
                    <div key={dia} className="text-center text-xs font-semibold text-gray-400 py-1">
                        {dia}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {dias.map(dia => {
                    const clave = format(dia, 'yyyy-MM-dd')
                    const estado = estadoPorDia[clave]
                    const fueraDeMes = !isSameMonth(dia, mesActual)
                    const esPasado = isBefore(dia, hoy)
                    const seleccionado = fechaSeleccionada && isSameDay(dia, fechaSeleccionada)
                    const esSeleccionable = !fueraDeMes && !esPasado && (estado === 'disponible' || estado === 'ocupado')

                    let clases = 'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition '

                    if (fueraDeMes || esPasado) {
                        clases += 'text-gray-300 cursor-not-allowed'
                    } else if (estado === 'cerrado') {
                        clases += 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    } else if (estado === 'disponible') {
                        clases += 'bg-green-50 text-gray-700 hover:bg-green-100 cursor-pointer'
                    } else if (estado === 'ocupado') {
                        clases += 'bg-red-50 text-gray-700 hover:bg-red-100 cursor-pointer'
                    } else {
                        clases += 'text-gray-400 cursor-not-allowed'
                    }

                    if (seleccionado) {
                        clases += ' border-2 border-volare-azul'
                    }

                    return (
                        <button
                            key={clave}
                            type="button"
                            onClick={() => esSeleccionable && onSeleccionarFecha(dia)}
                            disabled={!esSeleccionable}
                            className={clases}
                        >
                            <span>{format(dia, 'd')}</span>
                            {esSeleccionable && (
                                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${estado === 'disponible' ? 'bg-volare-verde' : 'bg-red-500'}`} />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default CalendarioDisponibilidad
