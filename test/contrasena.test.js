import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validarContrasena, bytesUtf8 } from '../src/utilities/contrasena.js'

// Mismos bordes que backend/test/contrasena.test.js: las dos reglas deben coincidir.
test('acepta 8 caracteres, 72 ASCII y 36 ñ', () => {
    assert.equal(validarContrasena('a'.repeat(8)), null)
    assert.equal(validarContrasena('a'.repeat(72)), null)
    assert.equal(validarContrasena('ñ'.repeat(36)), null)
})

test('rechaza 7 caracteres, aunque sean ñ (14 bytes)', () => {
    assert.match(validarContrasena('a'.repeat(7)), /al menos 8/)
    assert.match(validarContrasena('ñ'.repeat(7)), /al menos 8/)
})

test('rechaza más de 72 bytes', () => {
    assert.match(validarContrasena('a'.repeat(73)), /72/)
    assert.match(validarContrasena('ñ'.repeat(37)), /tilde o ñ/)
})

test('cuenta los bytes como UTF-8', () => {
    assert.equal(bytesUtf8('abc'), 3)
    assert.equal(bytesUtf8('ñá'), 4)
})
