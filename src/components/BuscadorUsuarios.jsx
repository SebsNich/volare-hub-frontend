import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2'
import AvatarUsuario from './AvatarUsuario'
import useDebounce from '../hooks/useDebounce'
import { nombreCompleto } from '../utilities/helpers'
import { API_URL } from '../config/api'

function BuscadorUsuarios({ className = '', inputClassName = '', onNavegar, autoFocus = false }) {
    const [texto, setTexto] = useState('')
    const [resultados, setResultados] = useState([])
    const [buscando, setBuscando] = useState(false)
    const [yaBusco, setYaBusco] = useState(false)
    const contenedorRef = useRef(null)
    const navigate = useNavigate()
    const textoDebounced = useDebounce(texto)

    useEffect(() => {
        const consulta = textoDebounced.trim()

        if (consulta.length < 2) return

        let cancelado = false

        async function buscar() {
            setBuscando(true)
            try {
                const respuesta = await fetch(`${API_URL}/api/usuarios/buscar?q=${encodeURIComponent(consulta)}`)
                const datos = await respuesta.json()
                if (!cancelado) {
                    setResultados(datos.usuarios ?? [])
                    setYaBusco(true)
                }
            } catch {
                if (!cancelado) {
                    setResultados([])
                    setYaBusco(true)
                }
            } finally {
                if (!cancelado) setBuscando(false)
            }
        }

        buscar()
        return () => { cancelado = true }
    }, [textoDebounced])

    useEffect(() => {
        function manejarClickFuera(e) {
            if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
                setTexto('')
            }
        }
        document.addEventListener('mousedown', manejarClickFuera)
        return () => document.removeEventListener('mousedown', manejarClickFuera)
    }, [])

    function irAPerfil(id) {
        navigate(`/perfil/${id}`)
        setTexto('')
        onNavegar?.()
    }

    const mostrarDropdown = texto.trim().length >= 2

    return (
        <div className={`relative ${className}`} ref={contenedorRef}>
            <div className="relative">
                <HiOutlineMagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    placeholder="Buscar residentes..."
                    autoFocus={autoFocus}
                    className={`w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul ${inputClassName}`}
                />
            </div>

            {mostrarDropdown && !buscando && (
                <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 max-h-72 overflow-y-auto">
                    {resultados.length > 0 ? (
                        resultados.map(usuario => (
                            <button
                                key={usuario.id}
                                type="button"
                                onClick={() => irAPerfil(usuario.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 transition"
                            >
                                <AvatarUsuario foto={usuario.foto} size={32} />
                                <span className="text-sm font-medium text-gray-700 truncate">{nombreCompleto(usuario)}</span>
                            </button>
                        ))
                    ) : (
                        yaBusco && (
                            <p className="px-3 py-3 text-sm text-gray-400 text-center">No se encontraron residentes</p>
                        )
                    )}
                </div>
            )}
        </div>
    )
}

export default BuscadorUsuarios
