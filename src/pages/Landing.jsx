import { useEffect, useState } from 'react'
import CarruselLanding from '../components/CarruselLanding'
import TarjetaNoticia from '../components/TarjetaNoticia'
import MiniLandingCompleta from '../components/MiniLandingCompleta'
import BienvenidaLanding from '../components/BienvenidaLanding'
import HeroLanding from '../components/HeroLanding'
import { API_URL } from '../config/api'

function Landing() {
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(false)
    const [slides, setSlides] = useState([])
    const [noticias, setNoticias] = useState([])
    const [paginaNoticias, setPaginaNoticias] = useState(1)
    const [hayMasNoticias, setHayMasNoticias] = useState(false)
    const [cargandoMas, setCargandoMas] = useState(false)

    async function cargarLandingInicial() {
        setCargando(true)
        setError(false)

        try {
            const [respuestaCarrusel, respuestaNoticias] = await Promise.all([
                fetch(`${API_URL}/api/landing/carrusel`),
                fetch(`${API_URL}/api/landing/noticias?pagina=1`)
            ])

            if (!respuestaCarrusel.ok || !respuestaNoticias.ok) {
                throw new Error('Respuesta no exitosa')
            }

            const datosCarrusel = await respuestaCarrusel.json()
            const datosNoticias = await respuestaNoticias.json()

            setSlides(datosCarrusel.slides)
            setNoticias(datosNoticias.noticias)
            setHayMasNoticias(datosNoticias.hayMas)
            setPaginaNoticias(1)
        } catch {
            setError(true)
        } finally {
            setCargando(false)
        }
    }

    async function cargarMasNoticias() {
        setCargandoMas(true)
        try {
            const siguientePagina = paginaNoticias + 1
            const respuesta = await fetch(`${API_URL}/api/landing/noticias?pagina=${siguientePagina}`)
            if (!respuesta.ok) throw new Error('Respuesta no exitosa')

            const datos = await respuesta.json()
            setNoticias(anteriores => [...anteriores, ...datos.noticias])
            setHayMasNoticias(datos.hayMas)
            setPaginaNoticias(siguientePagina)
        } catch {
            setHayMasNoticias(false)
        } finally {
            setCargandoMas(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarLandingInicial()
    }, [])

    if (cargando) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
                Cargando...
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
                <p className="text-gray-600">
                    No se pudo cargar la información. Si el sitio estuvo inactivo, el servidor puede tardar
                    unos segundos en despertar.
                </p>
                <button
                    type="button"
                    onClick={cargarLandingInicial}
                    className="bg-volare-azul text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                >
                    Reintentar
                </button>
                {/* Registrarse e iniciar sesión no dependen de las noticias. */}
                <div className="w-full text-left">
                    <HeroLanding />
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
            <HeroLanding />

            <CarruselLanding slides={slides} />

            <BienvenidaLanding />

            <div className="flex flex-col md:grid md:grid-cols-[1fr_280px] gap-6 items-start">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {noticias.map(noticia => (
                            <TarjetaNoticia key={noticia.id} noticia={noticia} />
                        ))}
                    </div>
                    {noticias.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center text-gray-400">
                            Aún no hay noticias publicadas
                        </div>
                    )}
                    {hayMasNoticias && (
                        <button
                            type="button"
                            onClick={cargarMasNoticias}
                            disabled={cargandoMas}
                            className={`self-center px-6 py-2 rounded-lg text-sm font-semibold border transition ${
                                cargandoMas
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : 'bg-white text-volare-azul border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {cargandoMas ? 'Cargando...' : 'Cargar más'}
                        </button>
                    )}
                </div>

                <aside className="w-full md:sticky md:top-24">
                    <MiniLandingCompleta />
                </aside>
            </div>
        </div>
    )
}

export default Landing
