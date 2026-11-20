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

// Lo que cambia entre reservas y alícuotas es solo el detalle: el título y el tono son los mismos.
const DETALLES_ALICUOTA = {
    APROBADO: 'Tu alícuota quedó pagada. Gracias por estar al día.',
    RECHAZADO: 'El pago no se completó. Puedes intentarlo de nuevo desde Mis alícuotas.',
    DUPLICADO: 'El cobro llegó cuando la alícuota ya estaba pagada. La administración devolverá este cobro.',
    REVERSADO: 'El cobro llegó cuando la alícuota ya estaba pagada, así que se devolvió.'
}

export function textoEstadoPago(estado, tipo) {
    const texto = TEXTOS_ESTADO[estado] ?? { titulo: 'Estado desconocido', detalle: 'Consulta con la administración.', tono: 'aviso' }
    const detalleAlicuota = tipo === 'ALICUOTA' ? DETALLES_ALICUOTA[estado] : null
    return detalleAlicuota ? { ...texto, detalle: detalleAlicuota } : texto
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
    // Con una transferencia en revisión no se ofrece pagar otra vez (sería cobrar dos veces).
    if (reserva?.estado === 'PENDIENTE' && reserva?.transferenciaEnRevision === true) return 'EN_REVISION'
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

// ---------- Métodos de pago que ofrece el servidor ----------

// Si la respuesta falla o viene rara, se ofrece solo la transferencia: es el camino
// que existe en producción, así nadie ve un botón que luego no funciona.
export function normalizarMetodos(respuesta) {
    const enLinea = respuesta?.enLinea
    const hayEnLinea = Boolean(enLinea?.disponible) && typeof enLinea?.proveedor === 'string' && enLinea.proveedor !== ''
    return {
        enLinea: {
            disponible: hayEnLinea,
            proveedor: hayEnLinea ? enLinea.proveedor : null,
            esSimulacion: hayEnLinea && enLinea.esSimulacion === true,
            vigenciaMinutos: hayEnLinea && Number.isInteger(enLinea.vigenciaMinutos) ? enLinea.vigenciaMinutos : null
        },
        transferencia: { disponible: respuesta?.transferencia?.disponible !== false }
    }
}

// Solo para mostrar la cuenta regresiva. El servidor es quien vence la reserva.
export function minutosRestantes(creadoEn, vigenciaMinutos, ahora = Date.now()) {
    const inicio = Date.parse(creadoEn)
    if (!Number.isFinite(inicio) || !Number.isInteger(vigenciaMinutos) || vigenciaMinutos <= 0) return null
    const restanteMs = inicio + vigenciaMinutos * 60000 - ahora
    return Math.max(0, Math.ceil(restanteMs / 60000))
}

// En qué punto del camino está la reserva: PAGO, REVISION, CONFIRMADA o CERRADA.
export function pasoDelPago(reserva, pagos) {
    if (reserva?.estado === 'RECHAZADA') return 'CERRADA'
    if (reserva?.estado === 'APROBADA') return 'CONFIRMADA'
    const enRevision = transferenciaDelAlquiler(pagos)?.estado === 'PENDIENTE'
    return alquilerPagado(pagos) || enRevision ? 'REVISION' : 'PAGO'
}
