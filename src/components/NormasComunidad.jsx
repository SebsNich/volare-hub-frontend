import { useEffect } from 'react'
import {
    HiOutlineShieldCheck,
    HiOutlineHandRaised,
    HiOutlinePhoto,
    HiOutlineMegaphone,
    HiOutlineScale,
    HiOutlineLockClosed,
    HiOutlineExclamationTriangle
} from 'react-icons/hi2'
import Modal from './Modal'
import useNormasComunidad from '../hooks/useNormasComunidad'

const REGLAS = [
    {
        icono: HiOutlineHandRaised,
        color: 'bg-volare-azul',
        titulo: 'Respeto ante todo',
        descripcion: 'No se permite lenguaje soez, insultos, ni contenido discriminatorio hacia otros residentes o la administración.'
    },
    {
        icono: HiOutlinePhoto,
        color: 'bg-volare-verde',
        titulo: 'Contenido apropiado',
        descripcion: 'No se permite compartir imágenes obscenas, violentas o inapropiadas para una comunidad familiar.'
    },
    {
        icono: HiOutlineMegaphone,
        color: 'bg-volare-morado',
        titulo: 'Uso responsable',
        descripcion: 'Este espacio es para comunicados, avisos, obras y emprendimientos de la comunidad. Evita spam o contenido no relacionado.'
    },
    {
        icono: HiOutlineScale,
        color: 'bg-volare-naranja',
        titulo: 'Veracidad',
        descripcion: 'La información publicada debe ser verídica; no se permite difundir noticias falsas ni contenido que genere pánico o desinformación entre los residentes.'
    },
    {
        icono: HiOutlineLockClosed,
        color: 'bg-volare-amarillo',
        titulo: 'Privacidad',
        descripcion: 'No compartas datos personales de otros residentes (direcciones, teléfonos, fotos) sin su consentimiento.'
    }
]

function NormasComunidad({ onClose }) {
    const { marcarVista } = useNormasComunidad()

    useEffect(() => {
        marcarVista()
    }, [marcarVista])

    return (
        <Modal onClose={onClose}>
            <div className="flex flex-col items-center text-center gap-2 -mt-2">
                <div className="w-14 h-14 rounded-full bg-volare-azul/10 flex items-center justify-center text-volare-azul">
                    <HiOutlineShieldCheck size={30} />
                </div>
                <h2 className="text-xl font-bold text-volare-azul">Normas de la Comunidad</h2>
            </div>

            <div className="flex flex-col gap-4">
                {REGLAS.map(regla => {
                    const Icono = regla.icono
                    return (
                        <div key={regla.titulo} className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full ${regla.color} text-white flex items-center justify-center shrink-0`}>
                                <Icono size={20} />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{regla.titulo}</p>
                                <p className="text-sm text-gray-500">{regla.descripcion}</p>
                            </div>
                        </div>
                    )
                })}

                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <HiOutlineExclamationTriangle size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-red-700">Consecuencias</p>
                        <p className="text-sm text-red-600">
                            El incumplimiento de estas normas puede resultar en la edición o eliminación de la publicación sin previo aviso, una advertencia al usuario, o la desactivación de la cuenta en casos graves o reincidentes.
                        </p>
                    </div>
                </div>
            </div>

            <p className="text-xs text-gray-400 italic text-center">
                Al publicar contenido en Urbanización Volare, aceptas cumplir con estas normas. La administración se reserva el derecho de moderar cualquier contenido que las incumpla.
            </p>

            <button
                type="button"
                onClick={onClose}
                className="self-center bg-volare-azul text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
            >
                Entendido
            </button>
        </Modal>
    )
}

export default NormasComunidad
