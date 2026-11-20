import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nombrePeriodo, fechaLimiteDescuento, resumenCobro, estadoCuota, dolaresParaInput } from '../src/utilities/alicuotas.js'

const cuota = { periodo: '2026-12', estado: 'PENDIENTE', montoBaseCentavos: 6000, montoPuntualCentavos: 5500, diasPuntual: 5 }

test('nombrePeriodo escribe el mes en español', () => {
    assert.equal(nombrePeriodo('2026-12'), 'Diciembre 2026')
    assert.equal(nombrePeriodo('2027-01'), 'Enero 2027')
    assert.equal(nombrePeriodo('malo'), 'malo')
})

test('fechaLimiteDescuento dice hasta qué día vale el descuento', () => {
    assert.equal(fechaLimiteDescuento('2026-12-05'), '5 de diciembre')
    assert.equal(fechaLimiteDescuento('2026-03-10'), '10 de marzo')
})

test('resumenCobro muestra lo que el servidor dice que se paga hoy y el ahorro', () => {
    const temprano = resumenCobro({ ...cuota, pagarHoyCentavos: 5500, aplicaDescuento: true, descuentoHasta: '2026-12-05' })
    assert.equal(temprano.pagarHoyCentavos, 5500)
    assert.equal(temprano.ahorroCentavos, 500)
    assert.match(temprano.mensaje, /5 de diciembre/)
    const tarde = resumenCobro({ ...cuota, pagarHoyCentavos: 6000, aplicaDescuento: false, descuentoHasta: '2026-12-05' })
    assert.equal(tarde.ahorroCentavos, 0)
    assert.match(tarde.mensaje, /valor fijo/i)
})

test('estadoCuota resume el estado para mostrarlo', () => {
    assert.deepEqual(estadoCuota({ ...cuota, estado: 'PAGADA' }), { texto: 'Pagada', tono: 'exito' })
    assert.deepEqual(estadoCuota({ ...cuota, transferenciaEnRevision: true }), { texto: 'En revisión', tono: 'aviso' })
    assert.deepEqual(estadoCuota(cuota), { texto: 'Pendiente', tono: 'aviso' })
    assert.deepEqual(estadoCuota({ ...cuota, estado: 'ANULADA' }), { texto: 'Anulada', tono: 'neutro' })
})

test('dolaresParaInput formatea centavos para los campos del admin', () => {
    assert.equal(dolaresParaInput(6000), '60.00')
    assert.equal(dolaresParaInput(5550), '55.50')
})
