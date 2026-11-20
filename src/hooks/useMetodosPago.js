import { useEffect, useState } from 'react'
import { API_URL } from '../config/api'
import { normalizarMetodos } from '../utilities/pagos'

// Pregunta al servidor qué formas de pago ofrece. Mientras responde (o si falla)
// solo se considera la transferencia, que es la que siempre existe.
export function useMetodosPago() {
    const [estado, setEstado] = useState({ cargando: true, metodos: normalizarMetodos(null) })

    useEffect(() => {
        let vigente = true
        fetch(`${API_URL}/api/pagos/metodos`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
            .then(respuesta => (respuesta.ok ? respuesta.json() : null))
            .catch(() => null)
            .then(cuerpo => {
                if (vigente) setEstado({ cargando: false, metodos: normalizarMetodos(cuerpo) })
            })
        return () => { vigente = false }
    }, [])

    return estado
}
