import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import CampoContrasena from '../components/CampoContrasena'
import { API_URL } from '../config/api'

function RestablecerContrasena() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const navigate = useNavigate()
    const { mostrarToast } = useToast()

    const [nuevaContrasena, setNuevaContrasena] = useState('')
    const [confirmarContrasena, setConfirmarContrasena] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setEnviando(true)

        try {
            const respuesta = await fetch(`${API_URL}/api/auth/restablecer-contrasena`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, nuevaContrasena, confirmarContrasena })
            })
            const datos = await respuesta.json()

            if (!respuesta.ok) {
                mostrarToast(datos.mensaje || 'No se pudo restablecer la contraseña', 'error')
                return
            }

            mostrarToast(datos.mensaje || 'Contraseña actualizada correctamente', 'exito')
            navigate('/')
        } catch {
            mostrarToast('Error de conexión, intenta nuevamente', 'error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-volare-azul text-center">Restablecer Contraseña</h1>

                {!token ? (
                    <p className="text-sm text-gray-600 text-center">
                        Este enlace no es válido. Solicita la recuperación de contraseña desde la página de inicio.
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <CampoContrasena
                            value={nuevaContrasena}
                            placeholder="Nueva contraseña"
                            required
                            onChange={(e) => setNuevaContrasena(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <CampoContrasena
                            value={confirmarContrasena}
                            placeholder="Confirmar contraseña"
                            required
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            inputClassName="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <button
                            type="submit"
                            disabled={enviando}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${
                                enviando
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-volare-azul text-white hover:opacity-90 cursor-pointer'
                            }`}
                        >
                            {enviando ? 'Restableciendo...' : 'Restablecer Contraseña'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default RestablecerContrasena
