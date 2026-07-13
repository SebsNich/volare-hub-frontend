import { useEffect, useRef, useState } from 'react'
import { normalizarTexto } from '../utilities/helpers'

function SelectorBuscable({ opciones, valor, onSeleccionar, placeholder }) {
    const [abierto, setAbierto] = useState(false)
    const contenedorRef = useRef(null)

    useEffect(() => {
        function manejarClickFuera(e) {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setAbierto(false)
            }
        }
        document.addEventListener('mousedown', manejarClickFuera)
        return () => document.removeEventListener('mousedown', manejarClickFuera)
    }, [])

    const coincidencias = valor
        ? opciones.filter(opcion => normalizarTexto(opcion).includes(normalizarTexto(valor)))
        : opciones

    function seleccionar(opcion) {
        onSeleccionar(opcion)
        setAbierto(false)
    }

    return (
        <div className="relative" ref={contenedorRef}>
            <input
                type="text"
                value={valor}
                placeholder={placeholder}
                onChange={(e) => { onSeleccionar(e.target.value); setAbierto(true) }}
                onFocus={() => setAbierto(true)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
            />
            {abierto && coincidencias.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {coincidencias.map(opcion => (
                        <button
                            key={opcion}
                            type="button"
                            onClick={() => seleccionar(opcion)}
                            className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-volare-azul transition"
                        >
                            {opcion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SelectorBuscable
