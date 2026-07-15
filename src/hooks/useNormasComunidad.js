import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'normas_comunidad_vista'
const EVENTO = 'normas-comunidad-vista-cambio'

function normasYaVistas() {
    return localStorage.getItem(CLAVE) === 'true'
}

function useNormasComunidad() {
    const [vista, setVista] = useState(normasYaVistas)

    useEffect(() => {
        function actualizar() {
            setVista(normasYaVistas())
        }
        window.addEventListener(EVENTO, actualizar)
        return () => window.removeEventListener(EVENTO, actualizar)
    }, [])

    const marcarVista = useCallback(() => {
        localStorage.setItem(CLAVE, 'true')
        window.dispatchEvent(new Event(EVENTO))
    }, [])

    return { hayIndicador: !vista, marcarVista }
}

export default useNormasComunidad
