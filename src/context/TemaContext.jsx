import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CLAVE_TEMA, normalizarPreferencia, resolverTema, siguientePreferencia } from '../utilities/tema'

const TemaContext = createContext(null)
const CONSULTA_OSCURO = '(prefers-color-scheme: dark)'

function leerPreferenciaGuardada() {
    try {
        return normalizarPreferencia(localStorage.getItem(CLAVE_TEMA))
    } catch {
        // Navegación privada o almacenamiento bloqueado: se sigue al sistema.
        return 'sistema'
    }
}

function TemaProvider({ children }) {
    const [preferencia, setPreferencia] = useState(leerPreferenciaGuardada)
    const [sistemaOscuro, setSistemaOscuro] = useState(() => window.matchMedia(CONSULTA_OSCURO).matches)

    // Si el usuario cambia el modo de su sistema con la página abierta, se actualiza sola.
    useEffect(() => {
        const consulta = window.matchMedia(CONSULTA_OSCURO)
        const alCambiar = (evento) => setSistemaOscuro(evento.matches)
        consulta.addEventListener('change', alCambiar)
        return () => consulta.removeEventListener('change', alCambiar)
    }, [])

    const tema = resolverTema(preferencia, sistemaOscuro)

    useEffect(() => {
        document.documentElement.dataset.tema = tema
        document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'
    }, [tema])

    const elegir = useCallback((nueva) => {
        const valida = normalizarPreferencia(nueva)
        setPreferencia(valida)
        try { localStorage.setItem(CLAVE_TEMA, valida) } catch { /* se aplica igual en esta visita */ }
    }, [])

    const alternar = useCallback(() => elegir(siguientePreferencia(preferencia)), [elegir, preferencia])

    const valor = useMemo(() => ({ preferencia, tema, elegir, alternar }), [preferencia, tema, elegir, alternar])
    return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
function useTema() {
    return useContext(TemaContext)
}

export { TemaProvider, useTema }
