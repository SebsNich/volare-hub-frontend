import { estadoDeCuenta } from '../utilities/helpers'

// Tonos suaves a propósito: así no se confunden con la etiqueta sólida de
// Activo/Inactivo, que dice otra cosa (si la cuenta está habilitada).
const ESTILOS_CUENTA = {
    PENDIENTE: { texto: 'Pendiente', clases: 'bg-amber-100 text-amber-700' },
    APROBADA: { texto: 'Aprobada', clases: 'bg-green-100 text-green-700' },
    RECHAZADA: { texto: 'Rechazada', clases: 'bg-red-100 text-red-700' }
}

function EtiquetaCuenta({ usuario }) {
    const estilo = ESTILOS_CUENTA[estadoDeCuenta(usuario)] ?? ESTILOS_CUENTA.APROBADA
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${estilo.clases}`}>
            {estilo.texto}
        </span>
    )
}

export default EtiquetaCuenta
