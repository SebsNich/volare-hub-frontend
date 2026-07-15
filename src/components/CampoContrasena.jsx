import { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'

function CampoContrasena({ value, onChange, placeholder, required = false, inputClassName = '' }) {
    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <input
                type={visible ? 'text' : 'password'}
                value={value}
                placeholder={placeholder}
                required={required}
                onChange={onChange}
                className={`w-full pr-10 ${inputClassName}`}
            />
            <button
                type="button"
                onClick={() => setVisible(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={-1}
            >
                {visible ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
            </button>
        </div>
    )
}

export default CampoContrasena
