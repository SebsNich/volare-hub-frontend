import { useState, useEffect } from 'react'
import { HiOutlinePhone, HiOutlineEnvelope, HiOutlineGlobeAlt } from 'react-icons/hi2'
import { ICONO_PLATAFORMA } from '../utilities/constantes'
import { API_URL } from '../config/api'

function InfoContactoWidget({ envolver = false }) {
    const [contactoInfo, setContactoInfo] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        async function cargarContacto() {
            try {
                const respuesta = await fetch(`${API_URL}/api/contacto`)
                const datos = await respuesta.json()
                setContactoInfo(datos)
            } catch {
                setContactoInfo([])
            } finally {
                setCargando(false)
            }
        }
        cargarContacto()
    }, [])

    if (!cargando && envolver && contactoInfo.length === 0) {
        return null
    }

    const telefonos = contactoInfo.filter(c => c.tipo === 'TELEFONO')
    const correos = contactoInfo.filter(c => c.tipo === 'CORREO')
    const redesSociales = contactoInfo.filter(c => c.tipo === 'RED_SOCIAL')

    const bordeSkeleton = envolver ? '' : 'border-t border-gray-100 pt-3 mt-3'
    const bordeTelefonos = envolver ? '' : 'border-t border-gray-100 pt-3 mt-3'
    const bordeCorreos = envolver && telefonos.length === 0 ? '' : 'border-t border-gray-100 pt-3 mt-3'
    const bordeRedes = envolver && telefonos.length === 0 && correos.length === 0 ? '' : 'border-t border-gray-100 pt-3 mt-3'

    const contenido = cargando ? (
        <div className={`flex flex-col gap-2 animate-pulse ${bordeSkeleton}`}>
            <div className="h-3 bg-gray-100 rounded w-3/4 mx-auto" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto" />
        </div>
    ) : (
        <>
            {telefonos.length > 0 && (
                <div className={`flex flex-col gap-1 text-sm text-gray-600 text-center ${bordeTelefonos}`}>
                    {telefonos.map(c => (
                        <div key={c.id} className="flex items-center justify-center gap-2">
                            <HiOutlinePhone size={16} className="text-volare-azul shrink-0" />
                            {c.etiqueta ? `${c.etiqueta}: ${c.valor}` : c.valor}
                        </div>
                    ))}
                </div>
            )}

            {correos.length > 0 && (
                <div className={`flex flex-col gap-1 text-sm text-gray-600 text-center ${bordeCorreos}`}>
                    {correos.map(c => (
                        <a
                            key={c.id}
                            href={`mailto:${c.valor}`}
                            className="flex items-center justify-center gap-2 hover:text-volare-azul transition"
                        >
                            <HiOutlineEnvelope size={16} className="text-volare-azul shrink-0" />
                            {c.etiqueta ? `${c.etiqueta}: ${c.valor}` : c.valor}
                        </a>
                    ))}
                </div>
            )}

            {redesSociales.length > 0 && (
                <div className={`flex items-center justify-center gap-4 ${bordeRedes}`}>
                    {redesSociales.map(c => {
                        const Icono = ICONO_PLATAFORMA[c.plataforma] || HiOutlineGlobeAlt
                        return (
                            <a
                                key={c.id}
                                href={c.valor}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={c.plataforma}
                                className="text-volare-azul hover:opacity-70 transition-opacity"
                            >
                                <Icono size={22} />
                            </a>
                        )
                    })}
                </div>
            )}
        </>
    )

    if (!envolver) {
        return contenido
    }

    return (
        <div className="w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col">
            {contenido}
        </div>
    )
}

export default InfoContactoWidget
