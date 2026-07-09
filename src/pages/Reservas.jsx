import { useNavigate } from 'react-router-dom'
import { HiOutlineHomeModern, HiOutlineBuildingOffice2 } from 'react-icons/hi2'

const ESPACIOS = [
    {
        id: 'cabanas',
        titulo: 'Cabañas',
        icono: HiOutlineHomeModern,
        descripcion: 'Reserva una de nuestras 3 cabañas para tu evento',
        precio: '$15 + $25 garantía',
        ruta: '/reservas/cabanas'
    },
    {
        id: 'casa-club',
        titulo: 'Casa Club',
        icono: HiOutlineBuildingOffice2,
        descripcion: 'Reserva la Casa Club para tu evento social',
        precio: 'Desde $80 + garantía',
        ruta: '/reservas/casa-club'
    }
]

function Reservas() {
    const navigate = useNavigate()

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-volare-azul mb-6">Reserva un espacio común</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ESPACIOS.map(espacio => {
                    const Icono = espacio.icono
                    return (
                        <div
                            key={espacio.id}
                            className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-volare-azul/10 flex items-center justify-center text-volare-azul">
                                <Icono size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-volare-azul">{espacio.titulo}</h2>
                            <p className="text-gray-600">{espacio.descripcion}</p>
                            <p className="text-lg font-semibold text-volare-verde">{espacio.precio}</p>
                            <button
                                onClick={() => navigate(espacio.ruta)}
                                className="bg-volare-azul text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition mt-2"
                            >
                                Reservar
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Reservas
