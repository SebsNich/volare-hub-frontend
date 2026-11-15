import { test } from 'node:test'
import assert from 'node:assert/strict'
import { montosDeTarifa, formatearDolares } from '../src/utilities/tarifas.js'

// Forma de la respuesta de GET /api/reservas/tarifas (campo "tarifas").
const TABLA = {
    CABANA_ARBOL: {
        CABANA_COMPLETO: {
            residente: { alquilerCentavos: 1500, garantiaCentavos: 2500 },
            tercero: { alquilerCentavos: 1500, garantiaCentavos: 2500 }
        }
    },
    CASA_CLUB: {
        CASA_CLUB_NOCTURNO: {
            residente: { alquilerCentavos: 10000, garantiaCentavos: 10000 },
            tercero: { alquilerCentavos: 20000, garantiaCentavos: 20000 }
        }
    }
}

test('busca el precio de residente o de tercero y suma el total', () => {
    assert.deepEqual(montosDeTarifa(TABLA, 'CASA_CLUB', 'CASA_CLUB_NOCTURNO', false), { alquilerCentavos: 10000, garantiaCentavos: 10000, totalCentavos: 20000 })
    assert.deepEqual(montosDeTarifa(TABLA, 'CASA_CLUB', 'CASA_CLUB_NOCTURNO', true), { alquilerCentavos: 20000, garantiaCentavos: 20000, totalCentavos: 40000 })
    assert.deepEqual(montosDeTarifa(TABLA, 'CABANA_ARBOL', 'CABANA_COMPLETO', false), { alquilerCentavos: 1500, garantiaCentavos: 2500, totalCentavos: 4000 })
})

test('sin tabla todavía, o con un espacio u horario que no está, devuelve null (no inventa un precio)', () => {
    assert.equal(montosDeTarifa(null, 'CASA_CLUB', 'CASA_CLUB_NOCTURNO', false), null)
    assert.equal(montosDeTarifa(TABLA, 'PISCINA', 'CABANA_COMPLETO', false), null)
    assert.equal(montosDeTarifa(TABLA, 'CASA_CLUB', 'CASA_CLUB_MATUTINO', false), null)
    assert.equal(montosDeTarifa(TABLA, null, null, false), null)
})

test('formatearDolares muestra dólares enteros sin decimales, como antes', () => {
    assert.equal(formatearDolares(1500), '15')
    assert.equal(formatearDolares(20000), '200')
    assert.equal(formatearDolares(8050), '80.50')
    assert.equal(formatearDolares(5), '0.05')
})
