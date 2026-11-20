import { HiOutlineComputerDesktop, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2'
import { useTema } from '../context/TemaContext'

const OPCIONES = [
    { valor: 'claro', etiqueta: 'Claro', Icono: HiOutlineSun },
    { valor: 'sistema', etiqueta: 'Sistema', Icono: HiOutlineComputerDesktop },
    { valor: 'oscuro', etiqueta: 'Oscuro', Icono: HiOutlineMoon }
]

// Tres opciones visibles a la vez: así nadie tiene que adivinar qué hace el botón.
function SelectorTema({ className = '' }) {
    const { preferencia, elegir } = useTema()

    return (
        <div role="radiogroup" aria-label="Tema de color" className={`selector-tema ${className}`}>
            {OPCIONES.map(({ valor, etiqueta, Icono }) => (
                <button
                    key={valor}
                    type="button"
                    role="radio"
                    aria-checked={preferencia === valor}
                    aria-label={etiqueta}
                    title={etiqueta}
                    onClick={() => elegir(valor)}
                    className="selector-tema__opcion"
                >
                    <Icono size={16} />
                </button>
            ))}
        </div>
    )
}

export default SelectorTema
