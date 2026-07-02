import { useState } from 'react'
import Modal from './Modal'

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
            <button 
                onClick={() => setModalAbierto(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 1000,
                    fontSize: '24px',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    cursor: 'pointer'
                }}
            >
                💬
            </button>
            {modalAbierto && (
                <Modal onClose={() => setModalAbierto(false)}>
                    <h3>Enviar Sugerencia</h3>
                    <form onSubmit={enviarSugerencia}>
                        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre de usuario" />
                        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                            <option value="">Seleccionar tipo</option>
                            <option value="SUGERENCIA">Sugerencia</option>
                            <option value="QUEJA">Queja</option>
                            <option value="CONSULTA">Consulta</option>
                            <option value="OTRO">OTRO</option>
                        </select>
                        <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Describe tu sugerencia, queja o consulta con detalle" />
                        <button type="submit">Enviar</button>
                    </form>
                </Modal>
            )}
        </>
    )
}

export default BotonSugerencia