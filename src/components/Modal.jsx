function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none transition"
                    aria-label="Cerrar"
                >
                    ✕
                </button>
                <div className="flex flex-col gap-4 pt-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal