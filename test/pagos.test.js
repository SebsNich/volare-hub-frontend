import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    leerParametrosRetorno,
    textoEstadoPago,
    pagoDelAlquiler,
    alquilerPagado,
    mostrarBotonesSimulador,
    accionPagoEnLista
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
