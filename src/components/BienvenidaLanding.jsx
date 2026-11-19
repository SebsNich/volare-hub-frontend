import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import ModalAuth from './ModalAuth'
import { mostrarLlamadosAccion, PASOS_COMO_FUNCIONA, SERVICIOS_DISPONIBLES } from '../utilities/landing'

// RF-03 (llamados a la acción) y RF-04 (cómo funciona) en la página pública.
// No pide datos al servidor: así se ve aunque el backend esté despertando.
function BienvenidaLanding() {
    const { usuario } = useContext(AuthContext)
    // null = modal cerrado; 'login' o 'registro' = abierto en ese modo.
    const [modoModal, setModoModal] = useState(null)

    return (
        <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-6">
            {mostrarLlamadosAccion(usuario) && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-volare-azul">Bienvenido a Volare Hub</h2>
                        <p className="text-sm text-gray-600">La plataforma de los propietarios y residentes de la urbanización.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button type="button" onClick={() => setModoModal('registro')}
                            className="bg-volare-verde text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                            Soy propietario: registrarme
                        </button>
                        <button type="button" onClick={() => setModoModal('login')}
                            className="border border-volare-azul text-volare-azul px-5 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                            Iniciar sesión
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <h2 className="text-lg font-bold text-volare-azul">Cómo funciona</h2>
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {PASOS_COMO_FUNCIONA.map((paso, indice) => (
                        <li key={paso.clave} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
                            <span className="text-xs font-semibold text-volare-naranja">Paso {indice + 1}</span>
                            <span className="font-semibold text-gray-800">{paso.titulo}</span>
                            <span className="text-sm text-gray-600">{paso.descripcion}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="font-semibold text-gray-700">Servicios disponibles</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICIOS_DISPONIBLES.map(servicio => (
                        <li key={servicio.titulo} className="text-sm">
                            <span className="font-semibold text-gray-800">{servicio.titulo}: </span>
                            <span className="text-gray-600">{servicio.descripcion}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {modoModal && <ModalAuth modoInicial={modoModal} onClose={() => setModoModal(null)} />}
        </section>
    )
}

export default BienvenidaLanding
