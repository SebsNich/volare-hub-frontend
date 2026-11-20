import { HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi2'

const TONOS = {
    exito: { Icono: HiOutlineCheckCircle, anillo: 'from-volare-verde to-emerald-400', texto: 'text-green-700' },
    error: { Icono: HiOutlineXCircle, anillo: 'from-red-500 to-orange-400', texto: 'text-red-600' },
    aviso: { Icono: HiOutlineClock, anillo: 'from-volare-naranja to-volare-amarillo', texto: 'text-yellow-700' }
}

// Resultado grande y claro: un icono con brillo, un título y qué sigue.
function EstadoPagoPanel({ tono = 'aviso', titulo, detalle, monto, children }) {
    const { Icono, anillo, texto } = TONOS[tono] ?? TONOS.aviso

    return (
        <section className="tarjeta-pro p-8 flex flex-col items-center text-center gap-4 aparecer" role="status">
            <span className={`relative w-20 h-20 rounded-full p-[3px] bg-gradient-to-br ${anillo} shadow-xl`}>
                <span className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Icono size={40} className={texto} />
                </span>
            </span>
            <div className="flex flex-col gap-1">
                <h1 className={`text-2xl font-bold ${texto}`}>{titulo}</h1>
                {monto && <p className="text-sm text-gray-500">{monto}</p>}
            </div>
            {detalle && <p className="text-sm text-gray-600 max-w-md">{detalle}</p>}
            {children}
        </section>
    )
}

export default EstadoPagoPanel
