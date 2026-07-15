function DrawerMovil({ abierto, onClose, children, zIndex = 1050 }) {
    if (!abierto) return null

    return (
        <div className="md:hidden fixed inset-0" style={{ zIndex }}>
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-xl p-6 flex flex-col gap-3 animate-volare-barrido-derecha max-h-[70vh] overflow-y-auto">
                {children}
            </div>
        </div>
    )
}

export default DrawerMovil
