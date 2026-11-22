import { test } from 'node:test'
import assert from 'node:assert/strict'
import { leerCorreos, problemaConAdjuntos, resumenResultado, mensajeVacio, problemaConRemitente, enlaceValido, anchoDeImagen } from '../src/utilities/informe.js'

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

test('el mensaje del editor está vacío si solo tiene etiquetas o espacios', () => {
    assert.equal(mensajeVacio(''), true)
    assert.equal(mensajeVacio('<p><br></p>'), true)
    assert.equal(mensajeVacio('<div>&nbsp;</div>'), true)
    assert.equal(mensajeVacio('<p>Hola</p>'), false)
    assert.equal(mensajeVacio('<p><br></p><img src="x">'), false)
})

test('el remitente debe ser un correo del dominio verificado', () => {
    assert.equal(problemaConRemitente('contabilidad@urbvolare.com'), null)
    assert.equal(problemaConRemitente(' Admin@UrbVolare.com '), null)
    assert.match(problemaConRemitente('alguien@gmail.com'), /@urbvolare.com/)
    assert.match(problemaConRemitente('roto'), /formato/)
})

test('los enlaces del editor solo pueden ser http, https o mailto', () => {
    assert.equal(enlaceValido('https://urbvolare.com'), 'https://urbvolare.com')
    assert.equal(enlaceValido('urbvolare.com/noticias'), 'https://urbvolare.com/noticias')
    assert.equal(enlaceValido('a@urbvolare.com'), 'mailto:a@urbvolare.com')
    assert.equal(enlaceValido('javascript:alert(1)'), null)
    assert.equal(enlaceValido('dos palabras'), null)
    assert.equal(enlaceValido(''), null)
})

test('el ancho mostrado de una imagen sale de su atributo o de su tamaño natural, con tope de 900', () => {
    assert.equal(anchoDeImagen('300', 900), 300)
    assert.equal(anchoDeImagen(null, 640), 640)
    assert.equal(anchoDeImagen(null, 4000), 900)
    assert.equal(anchoDeImagen(null, 0), 320)
    assert.equal(anchoDeImagen('abc', 500), 500)
})
