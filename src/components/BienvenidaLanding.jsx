import { PASOS_COMO_FUNCIONA, SERVICIOS_DISPONIBLES } from '../utilities/landing'

// RF-04 (cómo funciona) en la página pública. Los llamados a la acción (RF-03)
// están en HeroLanding. No pide datos al servidor: se ve aunque el backend despierte.
function BienvenidaLanding() {
    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Cómo <span className="texto-degradado">funciona</span></h2>
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PASOS_COMO_FUNCIONA.map((paso, indice) => (
                        <li key={paso.clave} className="tarjeta-pro p-5 flex flex-col gap-2 relative overflow-hidden">
                            <span className="absolute -top-3 -right-1 text-7xl font-black text-gray-100 select-none" aria-hidden="true">{indice + 1}</span>
                            <span className="relative text-xs font-bold uppercase tracking-widest text-volare-naranja">Paso {indice + 1}</span>
                            <span className="relative font-semibold text-gray-800">{paso.titulo}</span>
                            <span className="relative text-sm text-gray-600">{paso.descripcion}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-800">Servicios disponibles</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SERVICIOS_DISPONIBLES.map(servicio => (
                        <li key={servicio.titulo} className="text-sm rounded-xl border border-gray-100 bg-white/60 px-4 py-3">
                            <span className="font-semibold text-gray-800">{servicio.titulo}: </span>
                            <span className="text-gray-600">{servicio.descripcion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}

export default BienvenidaLanding
