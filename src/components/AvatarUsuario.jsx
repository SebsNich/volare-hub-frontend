import { HiOutlineUserCircle } from 'react-icons/hi2'

function AvatarUsuario({ foto, size = 40, className = '' }) {
    const estiloTamano = { width: size, height: size }
    const tieneFoto = foto && foto.trim() !== '' && foto !== 'null' && foto !== 'undefined'

    return (
        <div
            style={estiloTamano}
            className={`rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0 ${className}`}
        >
            {tieneFoto ? (
                <img src={foto} className="w-full h-full object-contain" />
            ) : (
                <HiOutlineUserCircle size={size * 0.85} className="text-gray-300" />
            )}
        </div>
    )
}

export default AvatarUsuario
