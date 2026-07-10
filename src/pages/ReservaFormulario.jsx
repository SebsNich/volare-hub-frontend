import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import FormularioReserva from '../components/FormularioReserva'
import { useToast } from '../context/ToastContext'

function ReservaFormulario() {
    const { state } = useLocation()
    const navigate = useNavigate()
    const { mostrarToast } = useToast()

    const datosCompletos = state?.espacio && state?.fecha && state?.horario

    useEffect(() => {
        if (!datosCompletos) {
            mostrarToast('Selecciona primero un espacio, fecha y horario', 'error')
            navigate('/reservas', { replace: true })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [datosCompletos])

    if (!datosCompletos) return null

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <FormularioReserva espacio={state.espacio} fecha={state.fecha} horario={state.horario} />
        </div>
    )
}

export default ReservaFormulario
