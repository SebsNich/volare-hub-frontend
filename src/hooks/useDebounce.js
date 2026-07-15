import { useState, useEffect } from 'react'

function useDebounce(valor, delayMs = 350) {
    const [valorDebounced, setValorDebounced] = useState(valor)

    useEffect(() => {
        const temporizador = setTimeout(() => setValorDebounced(valor), delayMs)
        return () => clearTimeout(temporizador)
    }, [valor, delayMs])

    return valorDebounced
}

export default useDebounce
