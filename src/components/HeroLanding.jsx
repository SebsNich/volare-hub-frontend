import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineNewspaper, HiOutlineCalendarDays, HiOutlineBanknotes, HiArrowRight } from 'react-icons/hi2'
import { AuthContext } from '../context/AuthContext'
import ModalAuth from './ModalAuth'
import { mostrarLlamadosAccion } from '../utilities/landing'
import { esCuentaPendiente } from '../utilities/helpers'

const BENEFICIOS = [
    { Icono: HiOutlineNewspaper, titulo: 'Noticias y avisos', texto: 'Lo que pasa en la urbanización, al instante.' },
    { Icono: HiOutlineCalendarDays, titulo: 'Reservas claras', texto: 'Cabañas y Casa Club con calendario en vivo.' },
    { Icono: HiOutlineBanknotes, titulo: 'Pagos con respaldo', texto: 'En línea o por transferencia, con comprobante.' }
]

// RF-03: llamados a la acción de la página pública. No pide datos al servidor,
// así que se ve aunque el backend esté despertando.
function HeroLanding() {
    const { usuario } = useContext(AuthContext)
    // null = modal cerrado; 'login' o 'registro' = abierto en ese modo.
    const [modoModal, setModoModal] = useState(null)
    const visitante = mostrarLlamadosAccion(usuario)
    const puedeUsarServicios = usuario && !esCuentaPendiente(usuario)

    return (
        <section className="relative overflow-hidden rounded-3xl border border-gray-100 vidrio px-6 py-10 sm:px-12 sm:py-14 aparecer">
            {/* Luces decorativas: dan profundidad y no llevan información. */}
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-volare-azul/30 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -left-10 w-72 h-72 rounded-full bg-volare-morado/25 blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
                <div className="flex flex-col gap-5">
                    <span className="self-start inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gray-200 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-volare-verde punto-vivo" />
                        Volare Hub
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-gray-900">
                        Tu comunidad, <span className="texto-degradado">conectada</span> en un solo lugar
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-xl">
                        {usuario
                            ? `Hola, ${usuario.nombres?.split(' ')[0] ?? ''}. Estas son tus puertas de entrada a la urbanización.`
                            : 'La plataforma de propietarios y residentes de la Urbanización Volare: noticias, reservas y pagos sin papeleo.'}
                    </p>

                    {visitante ? (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => setModoModal('registro')}
                                className="bg-volare-verde text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2"
                            >
                                Soy propietario: registrarme <HiArrowRight size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setModoModal('login')}
                                className="border border-volare-azul text-volare-azul px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
                            >
                                Iniciar sesión
                            </button>
                        </div>
                    ) : puedeUsarServicios && (
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/feed" className="bg-volare-azul text-white px-6 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2">
                                Ir a la comunidad <HiArrowRight size={18} />
                            </Link>
                            <Link to="/reservas" className="border border-volare-azul text-volare-azul px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition text-center">
                                Reservar un espacio
                            </Link>
                        </div>
                    )}
                </div>

                <ul className="flex flex-col gap-3">
                    {BENEFICIOS.map(({ Icono, titulo, texto }, indice) => (
                        <li
                            key={titulo}
                            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white/60 px-4 py-3 shadow-sm aparecer"
                            style={{ animationDelay: `${120 + indice * 90}ms` }}
                        >
                            <span className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-volare-azul to-volare-morado text-white flex items-center justify-center shadow-md">
                                <Icono size={22} />
                            </span>
                            <span className="flex flex-col">
                                <span className="font-semibold text-gray-800">{titulo}</span>
                                <span className="text-sm text-gray-600">{texto}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {modoModal && <ModalAuth modoInicial={modoModal} onClose={() => setModoModal(null)} />}
        </section>
    )
}

export default HeroLanding
