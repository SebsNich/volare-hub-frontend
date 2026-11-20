// Tarjeta con icono, título y contenido para cada forma de pago.
function TarjetaMetodo({ icono: Icono, titulo, descripcion, etiqueta, children }) {
    return (
        <section className="tarjeta-pro p-6 flex flex-col gap-4 aparecer">
            <header className="flex items-start gap-3">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-volare-azul to-volare-morado text-white flex items-center justify-center shadow-md">
                    <Icono size={22} />
                </span>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
                        {etiqueta && <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">{etiqueta}</span>}
                    </div>
                    <p className="text-sm text-gray-500">{descripcion}</p>
                </div>
            </header>
            {children}
        </section>
    )
}

export default TarjetaMetodo
