import { HiCheck } from 'react-icons/hi2'

const PASOS = ['Reserva enviada', 'Pago', 'Revisión', 'Confirmada']
// Cuántos pasos ya están completos en cada momento del camino.
const COMPLETOS = { PAGO: 1, REVISION: 2, CONFIRMADA: 4, CERRADA: 0 }

// Indica dónde está el residente en el proceso; así sabe qué falta sin leer texto.
function PasosPago({ paso }) {
    const completos = COMPLETOS[paso] ?? 1

    return (
        <ol className="flex items-center w-full" aria-label="Progreso de la reserva">
            {PASOS.map((nombre, indice) => {
                const hecho = indice < completos
                const actual = indice === completos
                return (
                    <li key={nombre} className={`flex items-center ${indice < PASOS.length - 1 ? 'flex-1' : ''}`}>
                        <div className="flex flex-col items-center gap-1.5 min-w-0">
                            <span
                                aria-current={actual ? 'step' : undefined}
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                    hecho
                                        ? 'text-white bg-gradient-to-br from-volare-azul to-volare-verde shadow-lg'
                                        : actual
                                            ? 'border-2 border-volare-azul text-volare-azul punto-vivo'
                                            : 'border-2 border-gray-300 text-gray-400'
                                }`}
                            >
                                {hecho ? <HiCheck size={18} /> : indice + 1}
                            </span>
                            <span className={`text-[11px] sm:text-xs font-semibold text-center leading-tight ${hecho || actual ? 'text-gray-800' : 'text-gray-400'}`}>
                                {nombre}
                            </span>
                        </div>
                        {indice < PASOS.length - 1 && (
                            <span className="flex-1 h-0.5 mx-2 sm:mx-3 -mt-5 rounded-full bg-gray-200 overflow-hidden">
                                <span
                                    className="block h-full bg-gradient-to-r from-volare-azul to-volare-verde transition-all duration-700"
                                    style={{ width: indice < completos - 1 ? '100%' : '0%' }}
                                />
                            </span>
                        )}
                    </li>
                )
            })}
        </ol>
    )
}

export default PasosPago
