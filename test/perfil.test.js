import { test } from 'node:test'
import assert from 'node:assert/strict'
import { textoUbicacion, etiquetaCasa } from '../src/utilities/perfil.js'

test('muestra manzana y villa juntas', () => {
    assert.equal(textoUbicacion({ manzana: '01', villa: '02' }), 'Mz 01 Vll 02')
})

test('sin manzana o sin villa no muestra nada (por ejemplo, un admin)', () => {
    assert.equal(textoUbicacion({ manzana: '01', villa: null }), '')
    assert.equal(textoUbicacion({ manzana: null, villa: '02' }), '')
    assert.equal(textoUbicacion({}), '')
    assert.equal(textoUbicacion(null), '')
})

test('etiquetaCasa usa el mismo formato en toda la interfaz', () => {
    assert.equal(etiquetaCasa('07', '03'), 'Mz 07 Vll 03')
})
