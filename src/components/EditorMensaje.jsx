import { useRef, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { enlaceValido } from '../utilities/informe'
import { imagenADataUrl, MAX_ANCHO_IMAGEN } from '../utilities/imagenEditor'
import { anchoDeImagen } from '../utilities/informe'

// Editor de mensajes tipo correo (negrita, listas, enlaces, imágenes).
// Usa el "contentEditable" del navegador, sin librerías nuevas. Es un campo no
// controlado: el texto vive en el propio editor y se avisa al padre con onChange.
// Los botones usan onMouseDown + preventDefault para no quitarle la selección al texto.
const boton = 'px-2.5 py-1 text-sm rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-100'

function EditorMensaje({ onChange, placeholder }) {
    const { mostrarToast } = useToast()
    const editor = useRef(null)
    const seleccion = useRef(null)
    const inputImagen = useRef(null)
    const [enlace, setEnlace] = useState(null) // null = cerrado; texto = dirección que se escribe
    const [imagenElegida, setImagenElegida] = useState(null) // la imagen del editor sobre la que se hizo clic
    const [anchoActual, setAnchoActual] = useState(0)

    const avisar = () => onChange(editor.current.innerHTML)

    function ejecutar(comando, valor = null) {
        editor.current.focus()
        document.execCommand(comando, false, valor)
        avisar()
    }

    const guardarSeleccion = () => {
        const s = window.getSelection()
        if (s.rangeCount && editor.current.contains(s.anchorNode)) seleccion.current = s.getRangeAt(0).cloneRange()
    }
    function restaurarSeleccion() {
        editor.current.focus()
        if (!seleccion.current) return
        const s = window.getSelection()
        s.removeAllRanges()
        s.addRange(seleccion.current)
    }

    function abrirEnlace() { guardarSeleccion(); setEnlace('') }
    function aplicarEnlace() {
        const url = enlaceValido(enlace)
        if (!url) return mostrarToast('Escribe una dirección válida (https://…)', 'error')
        restaurarSeleccion()
        const hayTexto = !window.getSelection().isCollapsed
        if (hayTexto) document.execCommand('createLink', false, url)
        else document.execCommand('insertHTML', false, `<a href="${url.replace(/"/g, '&quot;')}">${url.replace(/[<>&]/g, '')}</a>`)
        setEnlace(null)
        avisar()
    }

    async function insertarImagen(evento) {
        const archivo = evento.target.files[0]
        evento.target.value = ''
        if (!archivo) return
        try {
            const url = await imagenADataUrl(archivo)
            restaurarSeleccion()
            document.execCommand('insertImage', false, url)
            avisar()
        } catch (falla) {
            mostrarToast(falla.message, 'error')
        }
    }

    const evitarPerderSeleccion = (e) => e.preventDefault()

    // Clic en una imagen: se marca y aparecen los botones de tamaño. Clic en otro lado: se desmarca.
    function alHacerClic(evento) {
        if (imagenElegida) imagenElegida.removeAttribute('data-elegida')
        if (evento.target.tagName === 'IMG') {
            evento.target.setAttribute('data-elegida', 'true')
            setImagenElegida(evento.target)
            setAnchoActual(anchoDeImagen(evento.target.getAttribute('width'), evento.target.naturalWidth))
        } else {
            setImagenElegida(null)
        }
    }

    // El ancho va como atributo "width" (en píxeles); el servidor lo conserva entre 20 y 900.
    function cambiarAncho(ancho) {
        if (!imagenElegida) return
        const nuevo = Math.min(MAX_ANCHO_IMAGEN, Math.max(40, ancho))
        imagenElegida.setAttribute('width', String(nuevo))
        setAnchoActual(nuevo)
        avisar()
    }

    function quitarImagen() {
        imagenElegida?.remove()
        setImagenElegida(null)
        avisar()
    }

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="flex flex-wrap gap-1.5 p-2 bg-gray-50 border-b border-gray-200" role="toolbar" aria-label="Formato del mensaje">
                <button type="button" className={`${boton} font-bold`} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('bold')} aria-label="Negrita" title="Negrita">N</button>
                <button type="button" className={`${boton} italic`} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('italic')} aria-label="Cursiva" title="Cursiva">K</button>
                <button type="button" className={`${boton} underline`} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('underline')} aria-label="Subrayado" title="Subrayado">S</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('formatBlock', 'h2')} aria-label="Título" title="Título">Título</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('formatBlock', 'p')} aria-label="Párrafo normal" title="Párrafo normal">Normal</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('insertUnorderedList')} aria-label="Lista con viñetas" title="Lista con viñetas">• Lista</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('insertOrderedList')} aria-label="Lista numerada" title="Lista numerada">1. Lista</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={abrirEnlace} aria-label="Insertar enlace" title="Insertar enlace">Enlace</button>
                <button type="button" className={boton} onMouseDown={(e) => { e.preventDefault(); guardarSeleccion() }} onClick={() => inputImagen.current.click()} aria-label="Insertar imagen" title="Insertar imagen">Imagen</button>
                <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => ejecutar('removeFormat')} aria-label="Quitar formato" title="Quitar formato">Limpiar</button>
                <input ref={inputImagen} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={insertarImagen} aria-label="Elegir imagen" />
            </div>
            {enlace !== null && (
                // Un <div> y no un <form>: este editor ya va dentro del formulario del envío y los formularios no se anidan.
                <div className="flex flex-wrap items-center gap-2 p-2 bg-blue-50 border-b border-blue-100">
                    <input autoFocus className="border border-gray-300 rounded-md px-2 py-1 text-sm flex-1 min-w-48" value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://www.urbvolare.com" aria-label="Dirección del enlace"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aplicarEnlace() } }} />
                    <button type="button" onClick={aplicarEnlace} className="px-3 py-1 text-sm rounded-md bg-volare-azul text-white font-semibold">Aplicar</button>
                    <button type="button" className={boton} onClick={() => setEnlace(null)}>Cancelar</button>
                </div>
            )}
            {imagenElegida && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-blue-50 border-b border-blue-100" role="toolbar" aria-label="Tamaño de la imagen">
                    <span className="text-sm text-gray-700 mr-1">Imagen: {anchoActual}px</span>
                    <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => cambiarAncho(anchoActual - 40)} aria-label="Hacer la imagen más pequeña">− Más pequeña</button>
                    <button type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => cambiarAncho(anchoActual + 40)} aria-label="Hacer la imagen más grande">+ Más grande</button>
                    {[['Pequeña', 160], ['Mediana', 320], ['Grande', 480], ['Máximo', MAX_ANCHO_IMAGEN]].map(([nombre, px]) => (
                        <button key={nombre} type="button" className={boton} onMouseDown={evitarPerderSeleccion} onClick={() => cambiarAncho(px)}>{nombre}</button>
                    ))}
                    <button type="button" className={`${boton} text-red-600`} onMouseDown={evitarPerderSeleccion} onClick={quitarImagen} aria-label="Quitar la imagen">Quitar</button>
                </div>
            )}
            <div
                ref={editor}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label="Mensaje"
                data-placeholder={placeholder}
                onInput={avisar}
                onClick={alHacerClic}
                onBlur={guardarSeleccion}
                className="min-h-48 max-h-96 overflow-y-auto p-3 text-sm text-gray-800 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-volare-azul [&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:my-2 [&_img]:cursor-pointer [&_img[data-elegida=true]]:outline-2 [&_img[data-elegida=true]]:outline-volare-azul"
            />
        </div>
    )
}

export default EditorMensaje
