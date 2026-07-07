function Tooltip({ texto, children, className = '', posicion = 'arriba' }) {
    const posicionClases = posicion === 'abajo' ? 'top-full mt-2' : 'bottom-full mb-2'

    const contenido = (
        <div className="relative group inline-block">
            {children}
            <span className={`absolute ${posicionClases} left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-volare-azul text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50`}>
                {texto}
            </span>
        </div>
    )

    // Tailwind emite .relative después de .fixed/.absolute en el CSS generado,
    // así que mezclar esas clases con el "relative" de arriba rompería la posición.
    if (!className) return contenido
    return <div className={className}>{contenido}</div>
}

export default Tooltip
