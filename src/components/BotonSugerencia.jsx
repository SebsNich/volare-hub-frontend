import { useState, useContext } from 'react'
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import Modal from './Modal'
import Tooltip from './Tooltip'
import { AuthContext } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'

function BotonSugerencia() {
    const { usuario } = useContext(AuthContext)
    const { mostrarToast } = useToast()
    const [modalAbierto, setModalAbierto] = useState(false)
    const [nombre, setNombre] = useState('')
    const [manzana, setManzana] = useState('')
    const [villa, setVilla] = useState('')
    const [tipo, setTipo] = useState('')
    const [mensaje, setMensaje] = useState('')

    if (usuario?.rol === 'ADMIN') {
        return null
    }

    async function enviarSugerencia(e){
        e.preventDefault()

        if (!nombre.trim()) {
            mostrarToast('El nombre es obligatorio para enviar tu sugerencia', 'error')
            return
        }

        const respuesta = await fetch(`${API_URL}/api/buzon`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, manzana, villa, tipo, mensaje })
        })

        if (respuesta.ok) {
            setNombre('')
            setManzana('')
            setVilla('')
            setTipo('')
            setMensaje('')
            setModalAbierto(false)
            mostrarToast('Sugerencia enviada, gracias por tu mensaje', 'exito')
        } else {
            const datos = await respuesta.json()
            mostrarToast(datos.error || 'No se pudo enviar la sugerencia', 'error')
        }
    }

    return (
        <>
            <Tooltip texto="Enviar sugerencia" className="fixed bottom-6 right-6 z-[1000]">
                <button
                    onClick={() => setModalAbierto(true)}
                    className="w-14 h-14 rounded-full bg-volare-azul text-white shadow-lg hover:opacity-90 hover:shadow-xl transition flex items-center justify-center"
                    aria-label="Enviar sugerencia"
                >
                    <HiOutlineChatBubbleLeftRight size={26} />
                </button>
            </Tooltip>
            {modalAbierto && (
                <Modal onClose={() => setModalAbierto(false)}>
                    <h3 className="text-lg font-bold text-volare-azul">Enviar Sugerencia</h3>
                    <form onSubmit={enviarSugerencia} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">
                                Nombre <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Nombre de usuario"
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                            />
                        </div>
                        <input
                            type="text"
                            value={manzana}
                            onChange={(e) => setManzana(e.target.value)}
                            placeholder="Manzana"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <input
                            type="text"
                            value={villa}
                            onChange={(e) => setVilla(e.target.value)}
                            placeholder="Villa"
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        />
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul"
                        >
                            <option value="">Seleccionar tipo</option>
                            <option value="SUGERENCIA">Sugerencia</option>
                            <option value="QUEJA">Queja</option>
                            <option value="CONSULTA">Consulta</option>
                            <option value="OTRO">OTRO</option>
                        </select>
                        <textarea
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            placeholder="Describe tu sugerencia, queja o consulta con detalle"
                            rows={4}
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none"
                        />
                        <button
                            type="submit"
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Enviar
                        </button>
                    </form>
                </Modal>
            )}
        </>
    )
}

export default BotonSugerencia