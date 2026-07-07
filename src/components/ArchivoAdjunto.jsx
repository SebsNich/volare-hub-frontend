import { HiOutlineDocumentText, HiXMark } from 'react-icons/hi2'
import Tooltip from './Tooltip'

function ArchivoAdjunto({ nombre, href, onQuitar }) {
    const contenido = (
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-0">
            <HiOutlineDocumentText size={20} className="text-volare-azul shrink-0" />
            <span className="text-sm text-volare-azul truncate">{nombre}</span>
        </div>
    )

    return (
        <div className="relative">
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition">
                    {contenido}
                </a>
            ) : (
                contenido
            )}
            {onQuitar && (
                <Tooltip texto="Quitar" className="absolute -top-2 -right-2">
                    <button
                        type="button"
                        onClick={onQuitar}
                        className="bg-white rounded-full shadow p-0.5 text-gray-600 hover:text-red-500 flex items-center justify-center"
                        aria-label="Quitar"
                    >
                        <HiXMark size={14} />
                    </button>
                </Tooltip>
            )}
        </div>
    )
}

export default ArchivoAdjunto
