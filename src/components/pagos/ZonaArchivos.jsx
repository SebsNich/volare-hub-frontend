import { useRef, useState } from 'react'
import { HiOutlineArrowUpTray, HiOutlineXMark } from 'react-icons/hi2'

export const MAX_ARCHIVOS = 5

// Zona para arrastrar o elegir los comprobantes (JPG, PNG o PDF).
function ZonaArchivos({ archivos, alCambiar }) {
    const entrada = useRef(null)
    const [arrastrando, setArrastrando] = useState(false)

    function recibir(lista) {
        const nuevos = Array.from(lista ?? [])
        alCambiar([...archivos, ...nuevos].slice(0, MAX_ARCHIVOS))
    }

    return (
        <div className="flex flex-col gap-2">
            <div
                role="button"
                tabIndex={0}
                onClick={() => entrada.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); entrada.current?.click() } }}
                onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => { e.preventDefault(); setArrastrando(false); recibir(e.dataTransfer.files) }}
                className={`cursor-pointer rounded-2xl border-2 border-dashed px-4 py-6 flex flex-col items-center gap-1 text-center transition ${
                    arrastrando ? 'border-volare-azul bg-blue-50' : 'border-gray-300 hover:border-volare-azul hover:bg-gray-50'
                }`}
            >
                <HiOutlineArrowUpTray size={26} className="text-volare-azul" />
                <span className="text-sm font-semibold text-gray-700">Arrastra tu comprobante o toca para elegirlo</span>
                <span className="text-xs text-gray-500">JPG, PNG o PDF · hasta {MAX_ARCHIVOS} archivos</span>
                <input
                    ref={entrada}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                    onChange={(e) => { recibir(e.target.files); e.target.value = '' }}
                />
            </div>
            {archivos.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                    {archivos.map((archivo, indice) => (
                        <li key={`${archivo.name}-${indice}`} className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            <span className="truncate">{archivo.name}</span>
                            <button
                                type="button"
                                onClick={() => alCambiar(archivos.filter((_, i) => i !== indice))}
                                aria-label={`Quitar ${archivo.name}`}
                                className="text-gray-400 hover:text-red-500 transition shrink-0"
                            >
                                <HiOutlineXMark size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ZonaArchivos
