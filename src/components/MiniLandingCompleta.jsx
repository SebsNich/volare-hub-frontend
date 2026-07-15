import { useState } from 'react'
import InfoContactoWidget from './InfoContactoWidget'
import NormasComunidad from './NormasComunidad'
import useNormasComunidad from '../hooks/useNormasComunidad'
import { HiOutlineMapPin, HiChevronDown, HiOutlineShieldCheck } from 'react-icons/hi2'

function MiniLandingCompleta() {
    const [mapaAbierto, setMapaAbierto] = useState(false)
    const [modalNormasAbierto, setModalNormasAbierto] = useState(false)
    const { hayIndicador } = useNormasComunidad()

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
            <p className="text-sm text-gray-600 text-center font-medium">
                Urbanización Volare - Tu comunidad, tu hogar
            </p>
            <img
                src="/logo-volare.png"
                alt="Urbanización Volare"
                className="rounded-xl w-full h-32 sm:h-auto object-cover"
            />

            <InfoContactoWidget />

            <div className="border-t border-gray-100 pt-3 mt-1 sm:mt-3">
                <button
                    type="button"
                    onClick={() => setMapaAbierto(!mapaAbierto)}
                    className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-volare-azul"
                    aria-expanded={mapaAbierto}
                >
                    <span className="flex items-center gap-2">
                        <HiOutlineMapPin size={18} />
                        Ubicación
                    </span>
                    <HiChevronDown size={16} className={`transition-transform ${mapaAbierto ? 'rotate-180' : ''}`} />
                </button>
                {mapaAbierto && (
                    <div className="flex flex-col gap-2 mt-3 animate-volare-barrido-derecha">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.2672871234304!2d-79.91228681975285!3d-2.0490014702949377!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d130073dd52bb%3A0x53d14c338bbbff71!2sUrbanizaci%C3%B3n%20Volare!5e0!3m2!1ses-419!2sec!4v1783443664759!5m2!1ses-419!2sec"
                            className="w-full h-40 rounded-lg border-0"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                        />
                        <a
                            href="https://share.google/IQY3iORzwP4EO7Jl0"
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-volare-azul hover:underline text-center"
                        >
                            Ver en Google Maps
                        </a>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => setModalNormasAbierto(true)}
                className="relative self-center flex items-center gap-1.5 text-sm text-volare-azul hover:underline"
            >
                <HiOutlineShieldCheck size={16} />
                Normas de la Comunidad
                {hayIndicador && (
                    <span className="absolute -top-1 -right-2 w-2 h-2 bg-red-500 rounded-full" />
                )}
            </button>

            {modalNormasAbierto && <NormasComunidad onClose={() => setModalNormasAbierto(false)} />}
        </div>
    )
}

export default MiniLandingCompleta
