import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// RF-06: metadatos descriptivos para buscadores y para compartir el enlace.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const meta = (atributo, valor) => {
    const encontrado = html.match(new RegExp(`<meta\s+${atributo}="${valor}"\s+content="([^"]*)"`))
    return encontrado ? encontrado[1] : null
}

test('la página declara español como idioma', () => {
    assert.match(html, /<html lang="es">/)
})

test('tiene meta description de entre 50 y 160 caracteres', () => {
    const descripcion = meta('name', 'description')
    assert.ok(descripcion, 'falta meta description')
    assert.ok(descripcion.length >= 50 && descripcion.length <= 160, `largo ${descripcion.length}`)
})

test('tiene Open Graph básico: título, descripción, tipo e imagen', () => {
    for (const propiedad of ['og:title', 'og:description', 'og:type', 'og:image']) {
        assert.ok(meta('property', propiedad), `falta ${propiedad}`)
    }
})

test('no incluye datos privados (correos ni teléfonos)', () => {
    assert.doesNotMatch(html, /@[a-z0-9-]+\.[a-z]/i)
    assert.doesNotMatch(html, /\d{7,}/)
})
