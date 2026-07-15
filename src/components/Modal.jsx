import { createPortal } from 'react-dom'

function Modal({ children, onClose, className = '' }) {
    return createPortal(
        <div
            className="fixed inset-0 z-[1075] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[85vh] overflow-y-auto relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xl leading-none transition"
                    aria-label="Cerrar"
                >
                    ✕
                </button>
                <div className={`flex flex-col gap-4 pt-6 rounded-xl transition-all duration-300 ${className}`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Modal