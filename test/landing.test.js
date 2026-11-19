import { test } from 'node:test'
import assert from 'node:assert/strict'
import { modoInicialAuth, mostrarLlamadosAccion, PASOS_COMO_FUNCIONA, SERVICIOS_DISPONIBLES } from '../src/utilities/landing.js'

// RF-03: "Soy propietario: registrarme" abre el modal directo en el registro.
test('modoInicialAuth: registro abre el registro; cualquier otra cosa abre el inicio de sesión', () => {
    assert.equal(modoInicialAuth('registro'), 'registro')
    assert.equal(modoInicialAuth('login'), 'login')
    assert.equal(modoInicialAuth(undefined), 'login')
    // "recuperar" no se abre desde afuera: se llega desde el inicio de sesión.
    assert.equal(modoInicialAuth('recuperar'), 'login')
    assert.equal(modoInicialAuth('cualquier-cosa'), 'login')
})

test('los llamados a la acción se muestran solo a quien no inició sesión', () => {
    assert.equal(mostrarLlamadosAccion(null), true)
    assert.equal(mostrarLlamadosAccion(undefined), true)
    assert.equal(mostrarLlamadosAccion({ id: 'u1' }), false)
})

// RF-04: pasos de registro, verificación y acceso, en ese orden.
test('Cómo funciona tiene los tres pasos en orden: registro, verificación y acceso', () => {
    assert.deepEqual(PASOS_COMO_FUNCIONA.map(p => p.clave), ['registro', 'verificacion', 'acceso'])
    for (const paso of PASOS_COMO_FUNCIONA) {
        assert.ok(paso.titulo.length > 0 && paso.descripcion.length > 0)
    }
})

test('los servicios disponibles tienen título y descripción y no traen datos privados', () => {
    assert.ok(SERVICIOS_DISPONIBLES.length >= 3)
    const texto = JSON.stringify([PASOS_COMO_FUNCIONA, SERVICIOS_DISPONIBLES])
    // Ni correos, ni teléfonos, ni cuentas bancarias, ni cédulas en la página pública.
    assert.doesNotMatch(texto, /@|\d{7,}/)
    for (const servicio of SERVICIOS_DISPONIBLES) {
        assert.ok(servicio.titulo.length > 0 && servicio.descripcion.length > 0)
    }
})
