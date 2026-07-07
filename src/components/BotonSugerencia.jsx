import { useState } from 'react'
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2'
import Modal from './Modal'
import Tooltip from './Tooltip'

function BotonSugerencia() {
    const [modalAbierto, setModalAbierto] = useState(false)
    const [nombre, setNombre] = useState('')
    const [tipo, setTipo] = useState('')
    const [mensaje, setMensaje] = useState('')

    async function enviarSugerencia(e){
        e.preventDefault()
        const respuesta = await fetch('http://localhost:3000/api/buzon', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, tipo, mensaje })
        })

        if (respuesta.ok) {
            setNombre('')
            setTipo('')
            setMensaje('')
            setModalAbierto(false)
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
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre de usuario"
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