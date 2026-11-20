import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA } from '../../utilities/constantes'
import { formatearFechaReserva } from '../../utilities/helpers'

// Los montos son los que guardó el servidor en la reserva; aquí solo se muestran.
function ResumenCobro({ reserva, minutos }) {
    const alquiler = Number(reserva.montoAlquiler)
    const garantia = Number(reserva.montoGarantia)

    return (
        <aside className="tarjeta-brillo p-6 flex flex-col gap-5 lg:sticky lg:top-24">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">Resumen</span>
                <h2 className="text-xl font-bold text-gray-800">{NOMBRES_ESPACIO_RESERVA[reserva.espacio]}</h2>
            </div>

            <ul className="flex flex-col gap-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><HiOutlineCalendarDays size={18} className="text-volare-azul shrink-0" />{formatearFechaReserva(reserva.fecha)}</li>
                <li className="flex items-center gap-2"><HiOutlineClock size={18} className="text-volare-azul shrink-0" />{NOMBRES_HORARIO_RESERVA[reserva.horario]}</li>
                {reserva.motivoEvento && (
                    <li className="flex items-center gap-2"><HiOutlineClipboardDocumentList size={18} className="text-volare-azul shrink-0" /><span className="truncate">{reserva.motivoEvento}</span></li>
                )}
            </ul>

            <div className="border-t border-dashed border-gray-300 pt-4 flex flex-col gap-3">
                <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Alquiler a pagar ahora</span>
                    <span className="text-4xl font-extrabold texto-degradado font-[family-name:var(--font-display)]">${alquiler}</span>
                </div>
                <div className="flex items-center justify-between text-sm rounded-xl bg-gray-50 px-3 py-2">
                    <span className="text-gray-600">Garantía</span>
                    <span className="font-semibold text-gray-700">${garantia}</span>
                </div>
                <p className="text-xs text-gray-500">La garantía se entrega por transferencia, no se cobra aquí.</p>
            </div>

            {minutos !== null && minutos !== undefined && (
                <div className={`rounded-xl px-3 py-2 text-sm font-semibold flex items-center gap-2 ${minutos > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-700'}`}>
                    <HiOutlineClock size={18} className="shrink-0" />
                    {minutos > 0
                        ? `Tienes ${minutos} min para pagar en línea`
                        : 'El plazo del pago en línea terminó'}
                </div>
            )}
        </aside>
    )
}

export default ResumenCobro
