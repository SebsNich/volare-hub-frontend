import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizarCelular, enmascararCedula, enmascararEmail, fortalezaContrasena, requisitosContrasena } from '../src/utilities/credenciales.js'

test('normalizarCelular acepta formatos comunes y rechaza lo inválido', () => {
    assert.equal(normalizarCelular('0939619439'), '0939619439')
    assert.equal(normalizarCelular('+593 93 961 9439'), '0939619439')
    assert.equal(normalizarCelular('093-961-9439'), '0939619439')
    for (const malo of ['', '12345', '0239619439', '09396194390', null, undefined]) assert.equal(normalizarCelular(malo), null)
})

test('la cédula se muestra enmascarada y sin datos dice que no está registrada', () => {
    assert.equal(enmascararCedula('0932197924'), '09••••••24')
    assert.equal(enmascararCedula(null), 'No registrada')
    assert.equal(enmascararCedula('12'), 'No registrada')
})

test('el correo se enmascara dejando el dominio', () => {
    assert.equal(enmascararEmail('sebasnichr17@gmail.com'), 'se••••••••••@gmail.com')
    assert.equal(enmascararEmail('sin-arroba'), '')
})

test('la fortaleza sube con variedad y nunca felicita lo que el servidor rechaza', () => {
    assert.equal(fortalezaContrasena('').vacia, true)
    assert.equal(fortalezaContrasena('abc').nivel, 0)
    assert.ok(fortalezaContrasena('abcdefgh').nivel <= 2)
    assert.equal(fortalezaContrasena('Volare2026!Seguro').nivel, 4)
    assert.equal(fortalezaContrasena('a'.repeat(80)).nivel <= 1, true)
})

test('los requisitos obligatorios son largo y máximo', () => {
    const r = requisitosContrasena('abcdefgh')
    assert.deepEqual(r.filter(x => x.obligatorio).map(x => x.id), ['largo', 'valida'])
    assert.equal(r.find(x => x.id === 'numero').cumple, false)
})
