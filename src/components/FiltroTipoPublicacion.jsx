import { tipoColores } from '../utilities/constantes'

const TIPOS_FILTRO = [
    { value: 'TODOS', label: 'Todos', singular: null },
    { value: 'OBRA', label: 'Obras', singular: 'Obra' },
    { value: 'AVISO', label: 'Avisos', singular: 'Aviso' },
    { value: 'COMUNICADO', label: 'Comunicados', singular: 'Comunicado' },
    { value: 'EMPRENDIMIENTO', label: 'Emprendimientos', singular: 'Emprendimiento' },
]

function obtenerMensajeVacio(filtroTipo) {
    if (filtroTipo === 'TODOS') {
        return 'Aún no hay publicaciones'
    }
    const tipo = TIPOS_FILTRO.find(t => t.value === filtroTipo)
    return `Aún no hay ninguna publicación de ${tipo?.singular ?? filtroTipo}`
}

function FiltroTipoPublicacion({ filtroTipo, setFiltroTipo }) {
    return (
        <aside className="w-full md:sticky md:top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-volare-azul">Filtrar por tipo</h2>
            <div className="flex flex-col gap-2">
                {TIPOS_FILTRO.map(({ value, label }) => {
                    const activo = filtroTipo === value
                    const colorActivo = value === 'TODOS' ? 'bg-volare-azul' : tipoColores[value]
                    return (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFiltroTipo(value)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold text-left transition ${activo ? `${colorActivo} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {label}
                        </button>
                    )
                })}
            </div>
        </aside>
    )
}

export default FiltroTipoPublicacion
export { TIPOS_FILTRO, obtenerMensajeVacio }
