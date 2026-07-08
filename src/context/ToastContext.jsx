import { createContext, useCallback, useContext, useState } from 'react'
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2'

const ToastContext = createContext()

const DURACION_MS = 3000
const DURACION_SALIDA_MS = 300

let siguienteId = 0

function Toast({ mensaje, tipo, saliendo }) {
    const esExito = tipo === 'exito'
    const Icono = esExito ? HiOutlineCheckCircle : HiOutlineXCircle

    return (
        <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium max-w-sm transition-all duration-300 ease-out ${esExito ? 'bg-volare-verde' : 'bg-red-500'} ${saliendo ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0 animate-volare-toast-in'}`}
        >
            <Icono size={20} className="shrink-0" />
            {mensaje}
        </div>
    )
}

function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
        const id = ++siguienteId
        setToasts(actuales => [...actuales, { id, mensaje, tipo, saliendo: false }])

        setTimeout(() => {
            setToasts(actuales => actuales.map(toast => toast.id === id ? { ...toast, saliendo: true } : toast))
        }, DURACION_MS - DURACION_SALIDA_MS)

        setTimeout(() => {
            setToasts(actuales => actuales.filter(toast => toast.id !== id))
        }, DURACION_MS)
    }, [])

    return (
        <ToastContext.Provider value={{ mostrarToast }}>
            {children}
            <div className="fixed bottom-6 left-6 z-[1100] flex flex-col-reverse gap-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function useToast() {
    return useContext(ToastContext)
}

export { ToastProvider, useToast }
