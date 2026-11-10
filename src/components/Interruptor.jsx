// role="switch" + aria-checked hace que los lectores de pantalla anuncien
// "activado/desactivado" en vez de un botón genérico.
function Interruptor({ etiqueta, activo, onCambiar, deshabilitado = false }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={activo}
            onClick={onCambiar}
            disabled={deshabilitado}
            // Sin eventos en el botón deshabilitado, el hover llega al Tooltip que lo envuelve.
            className="flex items-center gap-2 px-2.5 py-1 rounded-full border border-gray-200 text-xs font-semibold text-volare-azul hover:bg-gray-50 transition disabled:opacity-50 disabled:pointer-events-none"
        >
            <span className={`relative w-8 h-4 rounded-full transition-colors ${activo ? 'bg-volare-verde' : 'bg-gray-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${activo ? 'translate-x-4' : ''}`} />
            </span>
            {etiqueta}
        </button>
    )
}

export default Interruptor
