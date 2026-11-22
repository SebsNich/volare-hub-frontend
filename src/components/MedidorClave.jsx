import { HiCheckCircle } from 'react-icons/hi2'
import { fortalezaContrasena, requisitosContrasena } from '../utilities/credenciales'

const COLORES = ['bg-red-500', 'bg-red-400', 'bg-volare-naranja', 'bg-volare-verde', 'bg-volare-verde']

// Barra de fortaleza + lista de requisitos que se marcan mientras se escribe.
// Es una guía: lo que manda es la regla del servidor.
function MedidorClave({ password }) {
    const { nivel, etiqueta, vacia } = fortalezaContrasena(password)
    const requisitos = requisitosContrasena(password)
    return (
        <div className="flex flex-col gap-2" aria-live="polite">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1" aria-hidden="true">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`h-1.5 flex-1 rounded-full ${!vacia && nivel >= n ? COLORES[nivel] : 'bg-gray-200'}`} />
                    ))}
                </div>
                <span className="text-xs font-semibold text-gray-600 w-20 text-right">{vacia ? 'Fortaleza' : etiqueta}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {requisitos.filter(r => r.id !== 'valida').map(r => (
                    <li key={r.id} className={`flex items-center gap-1.5 text-xs ${r.cumple ? 'text-green-700' : 'text-gray-500'}`}>
                        <HiCheckCircle size={14} className={r.cumple ? 'text-volare-verde' : 'text-gray-300'} />
                        {r.texto}{r.obligatorio ? '' : ' (recomendado)'}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default MedidorClave
