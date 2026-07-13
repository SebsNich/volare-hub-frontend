function ControlesPaginacion({ paginaActual, totalPaginas, onAnterior, onSiguiente }) {
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button
                type="button"
                onClick={onAnterior}
                disabled={paginaActual === 1}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${paginaActual === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-volare-azul text-white hover:opacity-90'}`}
            >
                Anterior
            </button>
            <span className="text-sm text-gray-500">Página {paginaActual} de {totalPaginas}</span>
            <button
                type="button"
                onClick={onSiguiente}
                disabled={paginaActual === totalPaginas}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${paginaActual === totalPaginas ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-volare-azul text-white hover:opacity-90'}`}
            >
                Siguiente
            </button>
        </div>
    )
}

export default ControlesPaginacion
