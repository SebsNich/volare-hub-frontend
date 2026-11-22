import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerCorreos, problemaConAdjuntos, resumenResultado } from '../src/utilities/informe.js'

test('leerCorreos separa por punto y coma, quita repetidos y marca los mal escritos', () => {
    const r = leerCorreos('a@x.com; B@x.com ;a@x.com;roto;c@x.com\n')
    assert.deepEqual(r.validos, ['a@x.com', 'b@x.com', 'c@x.com'])
    assert.deepEqual(r.invalidos, ['roto'])
})

test('leerCorreos con texto vacío no devuelve nada', () => {
    assert.deepEqual(leerCorreos(''), { validos: [], invalidos: [] })
})

test('problemaConAdjuntos revisa cantidad, peso por archivo y peso total', () => {
    const mb = (n) => ({ size: n * 1024 * 1024 })
    assert.equal(problemaConAdjuntos([mb(1), mb(2)]), null)
    assert.match(problemaConAdjuntos(Array(6).fill(mb(1))), /hasta 5/)
    assert.match(problemaConAdjuntos([mb(11)]), /10 MB/)
    assert.match(problemaConAdjuntos([mb(9), mb(9), mb(9)]), /20 MB/)
})

test('resumenResultado describe correo, fallidos y publicación', () => {
    const texto = resumenResultado({ correo: { enviados: 300, correosFallidos: ['x@y.com'] }, publicacion: { id: '1' } })
    assert.match(texto, /300 destinatarios/)
    assert.match(texto, /No se pudo enviar a 1/)
    assert.match(texto, /Comunicado publicado/)
    assert.match(resumenResultado({ correo: { enviados: 1, correosFallidos: [] }, publicacion: null }), /1 destinatario\./)
})
