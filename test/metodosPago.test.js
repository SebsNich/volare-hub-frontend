import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizarMetodos, minutosRestantes, pasoDelPago } from '../src/utilities/pagos.js'

test('si el servidor no responde bien, solo se ofrece la transferencia', () => {
    for (const rota of [null, undefined, 'x', {}, { enLinea: 3 }]) {
        const metodos = normalizarMetodos(rota)
        assert.equal(metodos.enLinea.disponible, false)
        assert.equal(metodos.transferencia.disponible, true)
    }
})

test('con pago en línea disponible se respeta lo que informa el servidor', () => {
    const metodos = normalizarMetodos({
        enLinea: { disponible: true, proveedor: 'SIMULADO', esSimulacion: true, vigenciaMinutos: 15 },
        transferencia: { disponible: true, proveedor: 'TRANSFERENCIA_MANUAL' }
    })
    assert.equal(metodos.enLinea.disponible, true)
    assert.equal(metodos.enLinea.proveedor, 'SIMULADO')
    assert.equal(metodos.enLinea.esSimulacion, true)
    assert.equal(metodos.enLinea.vigenciaMinutos, 15)
})

test('un proveedor en línea sin código no cuenta como disponible', () => {
    const metodos = normalizarMetodos({ enLinea: { disponible: true, proveedor: null }, transferencia: { disponible: true } })
    assert.equal(metodos.enLinea.disponible, false)
})

test('minutosRestantes cuenta hacia atrás y nunca baja de cero', () => {
    const creada = '2026-11-20T10:00:00.000Z'
    assert.equal(minutosRestantes(creada, 15, Date.parse('2026-11-20T10:00:00.000Z')), 15)
    assert.equal(minutosRestantes(creada, 15, Date.parse('2026-11-20T10:09:30.000Z')), 6)
    assert.equal(minutosRestantes(creada, 15, Date.parse('2026-11-20T10:15:00.000Z')), 0)
    assert.equal(minutosRestantes(creada, 15, Date.parse('2026-11-20T11:00:00.000Z')), 0)
})

test('minutosRestantes devuelve null si no hay plazo o fecha válida', () => {
    assert.equal(minutosRestantes(null, 15), null)
    assert.equal(minutosRestantes('no es fecha', 15), null)
    assert.equal(minutosRestantes('2026-11-20T10:00:00.000Z', null), null)
})

test('pasoDelPago: pagar, en revisión y confirmada', () => {
    const pendiente = { estado: 'PENDIENTE' }
    assert.equal(pasoDelPago(pendiente, []), 'PAGO')
    assert.equal(pasoDelPago(pendiente, [{ concepto: 'ALQUILER', proveedor: 'TRANSFERENCIA_MANUAL', estado: 'PENDIENTE' }]), 'REVISION')
    assert.equal(pasoDelPago(pendiente, [{ concepto: 'ALQUILER', proveedor: 'SIMULADO', estado: 'APROBADO' }]), 'REVISION')
    assert.equal(pasoDelPago({ estado: 'APROBADA' }, [{ concepto: 'ALQUILER', proveedor: 'SIMULADO', estado: 'APROBADO' }]), 'CONFIRMADA')
    assert.equal(pasoDelPago({ estado: 'RECHAZADA' }, []), 'CERRADA')
})
