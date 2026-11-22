import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

// Campo de contraseña con botón para mostrarla u ocultarla: quien escribe una
// clave larga necesita poder comprobar que no se equivocó al teclear.
function CampoClave({ id, etiqueta, value, onChange, autoComplete, placeholder = '', ayuda, error }) {
    const [visible, setVisible] = useState(false)
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-gray-700">{etiqueta}</label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    aria-invalid={error ? 'true' : undefined}
                    className={`w-full border rounded-lg pl-3 pr-11 py-2.5 focus:outline-none focus:ring-2 ${error ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-volare-azul'}`}
                />
                <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-volare-azul"
                    aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                    {visible ? <HiOutlineEyeSlash size={20} /> : <HiOutlineEye size={20} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
            {!error && ayuda && <p className="text-xs text-gray-500">{ayuda}</p>}
        </div>
    )
}

export default CampoClave
