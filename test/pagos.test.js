import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    leerParametrosRetorno,
    textoEstadoPago,
    pagoDelAlquiler,
    alquilerPagado,
    mostrarBotonesSimulador,
    accionPagoEnLista,
    filaPagoAdmin,
    transferenciaDelAlquiler,
    puedeEnviarTransferencia,
    textoTransferencia
} from '../src/utilities/pagos.js'

test('lee el id del pago y si viene del simulador', () => {
    assert.deepEqual(leerParametrosRetorno('?pago=abc&simulado=1'), { pagoId: 'abc', esSimulado: true })
    assert.deepEqual(leerParametrosRetorno('?pago=abc'), { pagoId: 'abc', esSimulado: false })
})

test('sin ?pago= no hay id', () => {
    assert.deepEqual(leerParametrosRetorno(''), { pagoId: null, esSimulado: false })
})

test('APROBADO y RECHAZADO se muestran como "Aprobado" y "Rechazado"', () => {
    assert.equal(textoEstadoPago('APROBADO').titulo, 'Aprobado')
    assert.equal(textoEstadoPago('RECHAZADO').titulo, 'Rechazado')
})

test('cada estado del servidor tiene un texto, y uno desconocido no rompe la pantalla', () => {
    for (const estado of ['PENDIENTE', 'VENCIDO', 'DUPLICADO', 'REVERSADO']) {
        assert.ok(textoEstadoPago(estado).titulo, estado)
    }
    assert.ok(textoEstadoPago('OTRO').titulo)
})

test('el pago del alquiler prefiere el aprobado; si no, el más reciente', () => {
    const pagos = [
        { id: 'nuevo', concepto: 'ALQUILER', estado: 'RECHAZADO' },
        { id: 'viejo', concepto: 'ALQUILER', estado: 'APROBADO' },
        { id: 'g', concepto: 'GARANTIA', estado: 'APROBADO' }
    ]
    assert.equal(pagoDelAlquiler(pagos).id, 'viejo')
    // El servidor los devuelve del más reciente al más antiguo.
    assert.equal(pagoDelAlquiler([{ id: 'a', concepto: 'ALQUILER', estado: 'PENDIENTE' }, { id: 'b', concepto: 'ALQUILER', estado: 'RECHAZADO' }]).id, 'a')
    assert.equal(pagoDelAlquiler([]), null)
    assert.equal(pagoDelAlquiler(undefined), null)
})

test('el alquiler está pagado solo con un pago APROBADO', () => {
    assert.equal(alquilerPagado([{ concepto: 'ALQUILER', estado: 'APROBADO' }]), true)
    assert.equal(alquilerPagado([{ concepto: 'ALQUILER', estado: 'PENDIENTE' }]), false)
    assert.equal(alquilerPagado([{ concepto: 'GARANTIA', estado: 'APROBADO' }]), false)
})

test('los botones del simulador solo aparecen con un pago pendiente que viene del simulador', () => {
    assert.equal(mostrarBotonesSimulador({ estado: 'PENDIENTE' }, true), true)
    assert.equal(mostrarBotonesSimulador({ estado: 'PENDIENTE' }, false), false)
    assert.equal(mostrarBotonesSimulador({ estado: 'APROBADO' }, true), false)
    assert.equal(mostrarBotonesSimulador(null, true), false)
})

// Mis Reservas: el servidor manda alquilerPagado; aquí solo se elige qué mostrar.
test('una reserva pendiente sin pagar muestra el botón Pagar', () => {
    assert.equal(accionPagoEnLista({ estado: 'PENDIENTE', alquilerPagado: false }), 'PAGAR')
})

test('una reserva con el alquiler pagado muestra Pagado y no Pagar', () => {
    assert.equal(accionPagoEnLista({ estado: 'PENDIENTE', alquilerPagado: true }), 'PAGADO')
    assert.equal(accionPagoEnLista({ estado: 'APROBADA', alquilerPagado: true }), 'PAGADO')
})

test('una reserva aprobada o rechazada sin pago en línea no muestra nada', () => {
    assert.equal(accionPagoEnLista({ estado: 'APROBADA', alquilerPagado: false }), null)
    assert.equal(accionPagoEnLista({ estado: 'RECHAZADA', alquilerPagado: false }), null)
})

test('si el servidor no manda alquilerPagado, se trata como no pagado', () => {
    assert.equal(accionPagoEnLista({ estado: 'PENDIENTE' }), 'PAGAR')
})

// Admin: cada pago de la reserva en una fila legible.
test('fila de pago del admin: concepto, proveedor, estado y monto legibles', () => {
    const fila = filaPagoAdmin({ id: 'p1', concepto: 'ALQUILER', proveedor: 'SIMULADO', estado: 'APROBADO', montoCentavos: 1500, creadoEn: '2026-11-18T20:05:00.000Z' })
    assert.equal(fila.concepto, 'Alquiler')
    assert.equal(fila.proveedor, 'En línea (simulado)')
    assert.equal(fila.estado, 'Aprobado')
    assert.equal(fila.tono, 'exito')
    assert.equal(fila.monto, '$15')
    assert.equal(fila.creadoEn, '2026-11-18T20:05:00.000Z')
})

test('fila de pago del admin: transferencia y garantía', () => {
    const fila = filaPagoAdmin({ concepto: 'GARANTIA', proveedor: 'TRANSFERENCIA_MANUAL', estado: 'PENDIENTE', montoCentavos: 2550 })
    assert.equal(fila.concepto, 'Garantía')
    assert.equal(fila.proveedor, 'Transferencia')
    assert.equal(fila.monto, '$25.50')
})

test('fila de pago del admin: un proveedor desconocido se muestra con su código', () => {
    assert.equal(filaPagoAdmin({ concepto: 'ALQUILER', proveedor: 'OTRO', estado: 'RECHAZADO', montoCentavos: 100 }).proveedor, 'OTRO')
})

test('fila de pago del admin: muestra el motivo si el pago lo tiene', () => {
    assert.equal(filaPagoAdmin({ concepto: 'ALQUILER', proveedor: 'SIMULADO', estado: 'VENCIDO', montoCentavos: 100, motivoRechazo: 'Plazo' }).motivo, 'Plazo')
    assert.equal(filaPagoAdmin({ concepto: 'ALQUILER', proveedor: 'SIMULADO', estado: 'VENCIDO', montoCentavos: 100 }).motivo, null)
})

// Bloque E2 (d): un cobro tardío tras el vencimiento también queda DUPLICADO o
// REVERSADO, y ahí el alquiler NO estaba pagado. El texto debe servir para ambos casos.
test('los textos de cobro duplicado o devuelto no afirman que el alquiler ya estaba pagado', () => {
    for (const estado of ['DUPLICADO', 'REVERSADO']) {
        const { detalle } = textoEstadoPago(estado)
        assert.doesNotMatch(detalle, /ya estaba pagado/)
        assert.match(detalle, /ya no estaba pendiente/)
    }
})

// ---------- Bloque E2 (c): transferencia manual ----------
const tm = (estado, extra = {}) => ({ concepto: 'ALQUILER', proveedor: 'TRANSFERENCIA_MANUAL', estado, ...extra })
const sim = (estado) => ({ concepto: 'ALQUILER', proveedor: 'SIMULADO', estado })
const pendiente = { estado: 'PENDIENTE' }

test('transferenciaDelAlquiler toma la transferencia más reciente e ignora los pagos en línea', () => {
    assert.equal(transferenciaDelAlquiler([sim('RECHAZADO')]), null)
    assert.equal(transferenciaDelAlquiler([tm('PENDIENTE', { id: 'nueva' }), tm('RECHAZADO', { id: 'vieja' })]).id, 'nueva')
})

test('puedeEnviarTransferencia: reserva pendiente, sin pagar y sin otra en revisión', () => {
    assert.equal(puedeEnviarTransferencia(pendiente, []), true)
    assert.equal(puedeEnviarTransferencia(pendiente, [sim('RECHAZADO')]), true)
    assert.equal(puedeEnviarTransferencia(pendiente, [tm('RECHAZADO')]), true)
    assert.equal(puedeEnviarTransferencia(pendiente, [tm('PENDIENTE')]), false)
    assert.equal(puedeEnviarTransferencia(pendiente, [sim('APROBADO')]), false)
    assert.equal(puedeEnviarTransferencia({ estado: 'RECHAZADA' }, []), false)
})

test('textoTransferencia: en revisión, rechazada con motivo y aprobada', () => {
    assert.match(textoTransferencia(tm('PENDIENTE')), /revisión/)
    assert.match(textoTransferencia(tm('RECHAZADO', { motivoRechazo: 'El monto no coincide' })), /El monto no coincide/)
    assert.match(textoTransferencia(tm('APROBADO')), /aprobada/)
    assert.equal(textoTransferencia(null), null)
})

test('filaPagoAdmin marca como decidible solo la transferencia PENDIENTE y trae la evidencia', () => {
    const fila = filaPagoAdmin({ ...tm('PENDIENTE'), montoCentavos: 1500, evidenciaUrls: ['a.jpg'] })
    assert.equal(fila.decidible, true)
    assert.deepEqual(fila.evidenciaUrls, ['a.jpg'])
    assert.equal(filaPagoAdmin({ ...tm('APROBADO'), montoCentavos: 1500 }).decidible, false)
    assert.equal(filaPagoAdmin({ ...sim('PENDIENTE'), montoCentavos: 1500 }).decidible, false)
    assert.deepEqual(filaPagoAdmin({ ...sim('PENDIENTE'), montoCentavos: 1500 }).evidenciaUrls, [])
})

// Tarea 3: una transferencia en revisión se muestra como "En revisión", no como "Pagar".
test('accionPagoEnLista: con transferencia en revisión devuelve EN_REVISION', () => {
    assert.equal(accionPagoEnLista({ estado: 'PENDIENTE', alquilerPagado: false, transferenciaEnRevision: true }), 'EN_REVISION')
})

test('accionPagoEnLista: Pagado gana sobre En revisión', () => {
    assert.equal(accionPagoEnLista({ estado: 'PENDIENTE', alquilerPagado: true, transferenciaEnRevision: true }), 'PAGADO')
})

test('textoEstadoPago habla de la alícuota cuando el pago es de una alícuota', () => {
    const aprobado = textoEstadoPago('APROBADO', 'ALICUOTA')
    assert.match(aprobado.detalle, /alícuota/i)
    assert.doesNotMatch(aprobado.detalle, /alquiler|reserva/i)
    assert.doesNotMatch(textoEstadoPago('RECHAZADO', 'ALICUOTA').detalle, /Mis Reservas/)
    assert.doesNotMatch(textoEstadoPago('DUPLICADO', 'ALICUOTA').detalle, /alquiler|reserva/i)
    assert.match(textoEstadoPago('APROBADO').detalle, /alquiler/)
})
