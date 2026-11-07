import { useEffect, useRef, useState } from 'react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

const INTERVALO_AUTOAVANCE_MS = 5000

function prefiereMovimientoReducido() {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function CarruselLanding({ slides }) {
    const [indice, setIndice] = useState(0)
    const [pausado, setPausado] = useState(false)
    const contenedorRef = useRef(null)

    const haySoloUnSlide = slides.length <= 1

    useEffect(() => {
        if (haySoloUnSlide || pausado || prefiereMovimientoReducido()) return

        const intervalo = setInterval(() => {
            setIndice(anterior => (anterior + 1) % slides.length)
        }, INTERVALO_AUTOAVANCE_MS)

        return () => clearInterval(intervalo)
    }, [haySoloUnSlide, pausado, slides.length])

    if (slides.length === 0) return null

    function irAAnterior() {
        setIndice(anterior => (anterior - 1 + slides.length) % slides.length)
    }

    function irASiguiente() {
        setIndice(anterior => (anterior + 1) % slides.length)
    }

    function manejarBlur(e) {
        if (!contenedorRef.current.contains(e.relatedTarget)) {
            setPausado(false)
        }
    }

    const slideActual = slides[indice]

    return (
        <div
            ref={contenedorRef}
            role="region"
            aria-label="Noticias destacadas"
            className="relative rounded-2xl overflow-hidden shadow-md"
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onFocus={() => setPausado(true)}
            onBlur={manejarBlur}
        >
            <img
                src={slideActual.imagenUrl}
                alt={slideActual.titulo}
                className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6">
                <h2 className="text-white text-lg sm:text-2xl font-bold drop-shadow">{slideActual.titulo}</h2>
            </div>

            {!haySoloUnSlide && (
                <>
                    <button
                        type="button"
                        onClick={irAAnterior}
                        aria-label="Noticia anterior"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <HiChevronLeft size={22} />
                    </button>
                    <button
                        type="button"
                        onClick={irASiguiente}
                        aria-label="Noticia siguiente"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <HiChevronRight size={22} />
                    </button>

                    <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-2">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => setIndice(i)}
                                aria-label={`Ir a la noticia ${i + 1}`}
                                aria-current={i === indice ? 'true' : undefined}
                                className={`w-2.5 h-2.5 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white ${i === indice ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default CarruselLanding
