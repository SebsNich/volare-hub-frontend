import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    PREFERENCIAS_TEMA,
    normalizarPreferencia,
    resolverTema,
    siguientePreferencia
} from '../src/utilities/tema.js'

test('solo existen tres preferencias: sistema, claro y oscuro', () => {
    assert.deepEqual(PREFERENCIAS_TEMA, ['sistema', 'claro', 'oscuro'])
})

test('un valor guardado desconocido o vacío vuelve a "sistema"', () => {
    assert.equal(normalizarPreferencia('morado'), 'sistema')
    assert.equal(normalizarPreferencia(null), 'sistema')
    assert.equal(normalizarPreferencia(undefined), 'sistema')
    assert.equal(normalizarPreferencia('oscuro'), 'oscuro')
})

test('"sistema" sigue lo que pida el sistema operativo', () => {
    assert.equal(resolverTema('sistema', true), 'oscuro')
    assert.equal(resolverTema('sistema', false), 'claro')
})

test('claro y oscuro ignoran al sistema operativo', () => {
    assert.equal(resolverTema('claro', true), 'claro')
    assert.equal(resolverTema('oscuro', false), 'oscuro')
})

test('el botón rota sistema, claro, oscuro y vuelve a sistema', () => {
    assert.equal(siguientePreferencia('sistema'), 'claro')
    assert.equal(siguientePreferencia('claro'), 'oscuro')
    assert.equal(siguientePreferencia('oscuro'), 'sistema')
})
