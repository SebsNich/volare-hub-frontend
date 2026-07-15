import { useState } from 'react'
import { HiOutlineFunnel, HiXMark } from 'react-icons/hi2'
import { tipoColores } from '../utilities/constantes'
import DrawerMovil from './DrawerMovil'

const TIPOS_FILTRO = [
    { value: 'TODOS', label: 'Todos', singular: null },
    { value: 'OBRA', label: 'Obras', singular: 'Obra' },
    { value: 'AVISO', label: 'Avisos', singular: 'Aviso' },
    { value: 'COMUNICADO', label: 'Comunicados', singular: 'Comunicado' },
    { value: 'EMPRENDIMIENTO', label: 'Emprendimientos', singular: 'Emprendimiento' },
]

function obtenerMensajeVacio(filtroTipo) {
    if (filtroTipo === 'TODOS') {
        return 'Aún no hay publicaciones'
    }
    const tipo = TIPOS_FILTRO.find(t => t.value === filtroTipo)
    return `Aún no hay ninguna publicación de ${tipo?.singular ?? filtroTipo}`
}

function ListaOpciones({ filtroTipo, onSeleccionar }) {
    return (
        <div className="flex flex-col gap-2">
            {TIPOS_FILTRO.map(({ value, label }) => {
                const activo = filtroTipo === value
                const colorActivo = value === 'TODOS' ? 'bg-volare-azul' : tipoColores[value]
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onSeleccionar(value)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-semibold text-left transition ${activo ? `${colorActivo} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}

function FiltroTipoPublicacion({ filtroTipo, setFiltroTipo }) {
    const [drawerAbierto, setDrawerAbierto] = useState(false)
    const hayFiltroActivo = filtroTipo !== 'TODOS'

    function seleccionarYCerrar(value) {
        setFiltroTipo(value)
        setDrawerAbierto(false)
    }

    return (
        <>
            <aside className="hidden md:flex md:order-3 w-full md:sticky md:top-24 bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex-col gap-3">
                <h2 className="text-lg font-semibold text-volare-azul">Filtrar por tipo</h2>
                <ListaOpciones filtroTipo={filtroTipo} onSeleccionar={setFiltroTipo} />
            </aside>

            <button
                type="button"
                onClick={() => setDrawerAbierto(true)}
                className="md:hidden fixed bottom-40 right-6 z-[900] w-14 h-14 rounded-full bg-volare-azul text-white shadow-lg hover:opacity-90 hover:shadow-xl transition flex items-center justify-center"
                aria-label="Filtrar publicaciones por tipo"
            >
                <HiOutlineFunnel size={24} />
                {hayFiltroActivo && (
                    <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-volare-naranja border-2 border-white" />
                )}
            </button>

            <DrawerMovil abierto={drawerAbierto} onClose={() => setDrawerAbierto(false)}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-volare-azul">Filtrar por tipo</h2>
                    <button
                        onClick={() => setDrawerAbierto(false)}
                        className="text-gray-400 hover:text-gray-600 transition"
                        aria-label="Cerrar"
                    >
                        <HiXMark size={22} />
                    </button>
                </div>
                <ListaOpciones filtroTipo={filtroTipo} onSeleccionar={seleccionarYCerrar} />
            </DrawerMovil>
        </>
    )
}

export default FiltroTipoPublicacion
export { TIPOS_FILTRO, obtenerMensajeVacio }
