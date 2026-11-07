import { tipoColores } from '../utilities/constantes'
import { TIPOS_FILTRO } from './FiltroTipoPublicacion'
import { formatearFechaReserva } from '../utilities/helpers'

function etiquetaTipo(tipo) {
    return TIPOS_FILTRO.find(t => t.value === tipo)?.singular ?? tipo
}

function TarjetaNoticia({ noticia }) {
    const colorTipo = tipoColores[noticia.tipo] ?? 'bg-volare-azul'

    if (!noticia.imagenUrl) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${colorTipo}`}>
                        {etiquetaTipo(noticia.tipo)}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatearFechaReserva(noticia.creadoEn)}</span>
                </div>
                <h3 className="text-base font-bold text-volare-azul">{noticia.titulo}</h3>
                <p className="text-sm text-gray-600">{noticia.descripcion}</p>
                <span className="text-xs text-gray-400">Administración Volare</span>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col">
            <img
                src={noticia.imagenUrl}
                alt={noticia.titulo}
                loading="lazy"
                className="w-full aspect-video object-cover"
            />
            <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${colorTipo}`}>
                        {etiquetaTipo(noticia.tipo)}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatearFechaReserva(noticia.creadoEn)}</span>
                </div>
                <h3 className="text-base font-bold text-volare-azul">{noticia.titulo}</h3>
                <p className="text-sm text-gray-600">{noticia.descripcion}</p>
                <span className="text-xs text-gray-400">Administración Volare</span>
            </div>
        </div>
    )
}

export default TarjetaNoticia
