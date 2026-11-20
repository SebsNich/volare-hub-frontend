// Textos y cuentas de pantalla de las alícuotas. El monto a pagar NUNCA se
// calcula aquí: lo informa el servidor (pagarHoyCentavos); esto solo lo presenta.
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const capitalizar = (t) => t.charAt(0).toUpperCase() + t.slice(1)

export function nombrePeriodo(periodo) {
    const m = /^(\d{4})-(\d{2})$/.exec(periodo ?? '')
    if (!m || Number(m[2]) < 1 || Number(m[2]) > 12) return periodo
    return `${capitalizar(MESES[Number(m[2]) - 1])} ${m[1]}`
}

export function fechaLimiteDescuento(fechaIso) {
    const [, , mes, dia] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fechaIso ?? '') ?? []
    if (!mes) return fechaIso
    return `${Number(dia)} de ${MESES[Number(mes) - 1]}`
}

export function resumenCobro(cuota) {
    const pagarHoyCentavos = cuota.pagarHoyCentavos
    const ahorroCentavos = cuota.aplicaDescuento ? cuota.montoBaseCentavos - cuota.montoPuntualCentavos : 0
    const mensaje = cuota.aplicaDescuento
        ? `Pagando hasta el ${fechaLimiteDescuento(cuota.descuentoHasta)} ahorras.`
        : 'Es un valor fijo mensual, sin recargos por mora.'
    return { pagarHoyCentavos, ahorroCentavos, mensaje }
}

export function estadoCuota(cuota) {
    if (cuota.estado === 'PAGADA') return { texto: 'Pagada', tono: 'exito' }
    if (cuota.estado === 'ANULADA') return { texto: 'Anulada', tono: 'neutro' }
    if (cuota.transferenciaEnRevision) return { texto: 'En revisión', tono: 'aviso' }
    return { texto: 'Pendiente', tono: 'aviso' }
}

export function dolaresParaInput(centavos) {
    return (centavos / 100).toFixed(2)
}
