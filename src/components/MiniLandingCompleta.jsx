import InfoContactoWidget from './InfoContactoWidget'
import { HiOutlineMapPin } from 'react-icons/hi2'

function MiniLandingCompleta() {
    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
            <p className="text-sm text-gray-600 text-center font-medium">
                Urbanización Volare - Tu comunidad, tu hogar
            </p>
            <img
                src="/logo-volare.png"
                alt="Urbanización Volare"
                className="rounded-xl w-full object-cover"
            />

            <InfoContactoWidget />

            <div className="flex flex-col gap-2 border-t border-gray-100 pt-3 mt-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-volare-azul">
                    <HiOutlineMapPin size={18} />
                    Ubicación
                </div>
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
        </div>
    )
}

export default MiniLandingCompleta
