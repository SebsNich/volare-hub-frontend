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
    DUPLICADO: { titulo: 'Cobro duplicado', detalle: 'Este alquiler ya estaba pagado. La administración devolverá este cobro.', tono: 'aviso' },
    REVERSADO: { titulo: 'Cobro devuelto', detalle: 'Este alquiler ya estaba pagado, así que este cobro se devolvió.', tono: 'aviso' }
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
