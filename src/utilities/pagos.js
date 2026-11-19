import { formatearDolares } from './tarifas.js'

// Lógica de las pantallas de pago. No calcula montos ni decide si se puede
// pagar: eso lo dice el servidor. Aquí solo se interpreta lo que respondió.

export function leerParametrosRetorno(search) {
    const params = new URLSearchParams(search)
    return { pagoId: params.get('pago') || null, esSimulado: params.get('simulado') === '1' }
}

const TEXTOS_ESTADO = {
    APROBADO: { titulo: 'Aprobado', detalle: 'Tu pago del alquiler quedó registrado. La administración revisará tu reserva.', tono: 'exito' },
    RECHAZADO: { titulo: 'Rechazado', detalle: 'El pago no se completó. Puedes intentarlo de nuevo desde Mis Reservas.', tono: 'error' },
    PENDIENTE: { titulo: 'Pendiente', detalle: 'Todavía no hay respuesta del proveedor de pago.', tono: 'aviso' },
    VENCIDO: { titulo: 'Vencido', detalle: 'Pasó el plazo para pagar en línea.', tono: 'aviso' },
    DUPLICADO: { titulo: 'Cobro duplicado', detalle: 'El cobro llegó cuando el alquiler ya estaba cubierto o la reserva ya no estaba pendiente. La administración devolverá este cobro.', tono: 'aviso' },
    REVERSADO: { titulo: 'Cobro devuelto', detalle: 'El cobro llegó cuando el alquiler ya estaba cubierto o la reserva ya no estaba pendiente, así que se devolvió.', tono: 'aviso' }
}

export function textoEstadoPago(estado) {
    return TEXTOS_ESTADO[estado] ?? { titulo: 'Estado desconocido', detalle: 'Consulta con la administración.', tono: 'aviso' }
}

// El servidor devuelve los pagos del más reciente al más antiguo.
export function pagoDelAlquiler(pagos) {
    const delAlquiler = (pagos ?? []).filter(pago => pago.concepto === 'ALQUILER')
    return delAlquiler.find(pago => pago.estado === 'APROBADO') ?? delAlquiler[0] ?? null
}

export function alquilerPagado(pagos) {
    return pagoDelAlquiler(pagos)?.estado === 'APROBADO'
}

// Los botones "Simular pago" existen solo para la demo con el proveedor simulado.
export function mostrarBotonesSimulador(pago, esSimulado) {
    return Boolean(esSimulado) && pago?.estado === 'PENDIENTE'
}

// Qué muestra Mis Reservas en la columna de estado. "Pagado" se muestra en
// cualquier estado de la reserva, para que el residente vea que su dinero llegó.
export function accionPagoEnLista(reserva) {
    if (reserva?.alquilerPagado === true) return 'PAGADO'
    if (reserva?.estado === 'PENDIENTE') return 'PAGAR'
    return null
}

const NOMBRES_CONCEPTO = { ALQUILER: 'Alquiler', GARANTIA: 'Garantía' }
const TRANSFERENCIA = 'TRANSFERENCIA_MANUAL'
const NOMBRES_PROVEEDOR = { SIMULADO: 'En línea (simulado)', [TRANSFERENCIA]: 'Transferencia' }

const esTransferenciaDelAlquiler = (pago) => pago.concepto === 'ALQUILER' && pago.proveedor === TRANSFERENCIA

// Una fila de la tabla de pagos que ve el admin en el detalle de la reserva.
export function filaPagoAdmin(pago) {
    const estado = textoEstadoPago(pago.estado)
    return {
        id: pago.id,
        concepto: NOMBRES_CONCEPTO[pago.concepto] ?? pago.concepto,
        proveedor: NOMBRES_PROVEEDOR[pago.proveedor] ?? pago.proveedor,
        estado: estado.titulo,
        tono: estado.tono,
        monto: `$${formatearDolares(pago.montoCentavos)}`,
        creadoEn: pago.creadoEn,
        motivo: pago.motivoRechazo ?? null,
        // Solo una transferencia en revisión espera la decisión del admin.
        decidible: pago.proveedor === TRANSFERENCIA && pago.estado === 'PENDIENTE',
        evidenciaUrls: pago.evidenciaUrls ?? []
    }
}

// ---------- Transferencia manual (residente) ----------

// El servidor devuelve los pagos del más reciente al más antiguo.
export function transferenciaDelAlquiler(pagos) {
    return (pagos ?? []).find(esTransferenciaDelAlquiler) ?? null
}

// El servidor vuelve a validar todo; esto solo decide si se muestra el formulario.
export function puedeEnviarTransferencia(reserva, pagos) {
    if (reserva?.estado !== 'PENDIENTE' || alquilerPagado(pagos)) return false
    return transferenciaDelAlquiler(pagos)?.estado !== 'PENDIENTE'
}

export function textoTransferencia(pago) {
    if (!pago) return null
    if (pago.estado === 'PENDIENTE') return 'Transferencia en revisión: la administración revisará tu comprobante.'
    if (pago.estado === 'RECHAZADO') return `Transferencia rechazada: ${pago.motivoRechazo ?? 'sin motivo'}. Puedes enviar otro comprobante.`
    if (pago.estado === 'APROBADO') return 'Transferencia aprobada.'
    return textoEstadoPago(pago.estado).detalle
}
