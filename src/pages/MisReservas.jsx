import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineArrowLeft } from 'react-icons/hi2'
import Modal from '../components/Modal'
import ArchivoAdjunto from '../components/ArchivoAdjunto'
import ControlesPaginacion from '../components/ControlesPaginacion'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA } from '../utilities/constantes'
import { formatearFechaReserva } from '../utilities/helpers'

const TAMANO_PAGINA = 10

function listaArchivos(urls, etiqueta) {
    if (!urls?.length) return null
    return urls.map((url, index) => (
        <ArchivoAdjunto key={url} nombre={urls.length > 1 ? `${etiqueta} ${index + 1}` : etiqueta} href={url} />
    ))
}

function MisReservas() {
    const { mostrarToast } = useToast()
    const navigate = useNavigate()
    const [reservas, setReservas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [reservaSeleccionada, setReservaSeleccionada] = useState(null)
    const [modalTexto, setModalTexto] = useState(null)
    const [filtroFecha, setFiltroFecha] = useState('')
    const [filtroEspacio, setFiltroEspacio] = useState('TODOS')
    const [filtroEstado, setFiltroEstado] = useState('TODOS')
    const [paginaReservas, setPaginaReservas] = useState(1)

    useEffect(() => {
        async function cargarReservas() {
            try {
                const respuesta = await fetch(`${API_URL}/api/reservas/mias`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (!respuesta.ok) throw new Error('Error al cargar reservas')
                const datos = await respuesta.json()
                setReservas(datos)
            } catch {
                mostrarToast('No se pudieron cargar tus reservas', 'error')
            } finally {
                setCargando(false)
            }
        }
        cargarReservas()

        fetch(`${API_URL}/api/reservas/mias/marcar-leidas`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function manejarClickFila(reserva) {
        if (reserva.estado === 'PENDIENTE') {
            navigate(`/reservas/editar/${reserva.id}`)
        } else {
            setReservaSeleccionada(reserva)
        }
    }

    const reservasFiltradas = reservas
        .filter(reserva => filtroFecha === '' || reserva.fecha.slice(0, 10) === filtroFecha)
        .filter(reserva => filtroEspacio === 'TODOS' || reserva.espacio === filtroEspacio)
        .filter(reserva => filtroEstado === 'TODOS' || reserva.estado === filtroEstado)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    const totalPaginas = Math.max(1, Math.ceil(reservasFiltradas.length / TAMANO_PAGINA))
    const paginaEfectiva = Math.min(paginaReservas, totalPaginas)
    const reservasPagina = reservasFiltradas.slice((paginaEfectiva - 1) * TAMANO_PAGINA, paginaEfectiva * TAMANO_PAGINA)

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
            <Link to="/reservas" className="self-start flex items-center gap-1 text-sm text-volare-azul hover:underline">
                <HiOutlineArrowLeft size={16} />
                Volver
            </Link>

            <h1 className="text-2xl font-bold text-volare-azul">Mis Reservas</h1>

            {!cargando && reservas.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center gap-3">
                    <p className="text-gray-600">Aún no has hecho ninguna reserva</p>
                    <Link
                        to="/reservas"
                        className="bg-volare-azul text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Reservar un espacio
                    </Link>
                </div>
            )}

            {reservas.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <input
                            type="date"
                            value={filtroFecha}
                            onChange={(e) => { setFiltroFecha(e.target.value); setPaginaReservas(1) }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-44"
                        />
                        <select
                            value={filtroEspacio}
                            onChange={(e) => { setFiltroEspacio(e.target.value); setPaginaReservas(1) }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-48"
                        >
                            <option value="TODOS">Todos los espacios</option>
                            {Object.entries(NOMBRES_ESPACIO_RESERVA).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <select
                            value={filtroEstado}
                            onChange={(e) => { setFiltroEstado(e.target.value); setPaginaReservas(1) }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul sm:w-44"
                        >
                            <option value="TODOS">Todos los estados</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="APROBADA">Aprobada</option>
                            <option value="RECHAZADA">Rechazada</option>
                        </select>
                        {filtroFecha && (
                            <button
                                type="button"
                                onClick={() => { setFiltroFecha(''); setPaginaReservas(1) }}
                                className="text-sm text-gray-500 hover:text-volare-azul whitespace-nowrap px-1"
                            >
                                Limpiar filtro de fecha
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                    <th className="px-4 py-3 whitespace-nowrap">Espacio</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Fecha</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Horario</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Monto total</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservasPagina.map(reserva => {
                                    const estilo = ESTILOS_ESTADO_RESERVA[reserva.estado]
                                    const total = Number(reserva.montoAlquiler) + Number(reserva.montoGarantia)
                                    return (
                                        <tr
                                            key={reserva.id}
                                            onClick={() => manejarClickFila(reserva)}
                                            className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-4 py-3 font-semibold text-volare-azul whitespace-nowrap">{NOMBRES_ESPACIO_RESERVA[reserva.espacio]}</td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatearFechaReserva(reserva.fecha)}</td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{NOMBRES_HORARIO_RESERVA[reserva.horario]}</td>
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">${total}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${estilo.color}`}>
                                                        <span className={`w-2 h-2 rounded-full ${estilo.punto}`} />
                                                        {estilo.label}
                                                    </span>
                                                    {reserva.estado === 'PENDIENTE' && reserva.observacionAdmin && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setModalTexto({ tipo: 'observacion', texto: reserva.observacionAdmin, reservaId: reserva.id })
                                                            }}
                                                            className="bg-volare-naranja text-white text-xs px-2 py-1 rounded-lg font-semibold hover:opacity-90 transition shrink-0"
                                                        >
                                                            Ver observación
                                                        </button>
                                                    )}
                                                    {reserva.estado === 'RECHAZADA' && reserva.motivoRechazo && (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                setModalTexto({ tipo: 'rechazo', texto: reserva.motivoRechazo })
                                                            }}
                                                            className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-semibold hover:opacity-90 transition shrink-0"
                                                        >
                                                            Ver motivo de rechazo
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {reservasPagina.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                            No se encontraron reservas con esos filtros
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <ControlesPaginacion
                            paginaActual={paginaEfectiva}
                            totalPaginas={totalPaginas}
                            onAnterior={() => setPaginaReservas(paginaEfectiva - 1)}
                            onSiguiente={() => setPaginaReservas(paginaEfectiva + 1)}
                        />
                    </div>
                </div>
            )}

            {reservaSeleccionada && (
                <Modal onClose={() => setReservaSeleccionada(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">{NOMBRES_ESPACIO_RESERVA[reservaSeleccionada.espacio]}</h3>
                    <p className="text-sm text-gray-500 -mt-3">
                        {formatearFechaReserva(reservaSeleccionada.fecha)} — {NOMBRES_HORARIO_RESERVA[reservaSeleccionada.horario]}
                    </p>

                    <span className={`self-start inline-flex items-center gap-1.5 text-xs font-semibold ${ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].color}`}>
                        <span className={`w-2 h-2 rounded-full ${ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].punto}`} />
                        {ESTILOS_ESTADO_RESERVA[reservaSeleccionada.estado].label}
                    </span>

                    {reservaSeleccionada.estado === 'RECHAZADA' && reservaSeleccionada.motivoRechazo && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">
                                <span className="font-semibold">Motivo de rechazo:</span> {reservaSeleccionada.motivoRechazo}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p><span className="font-semibold text-gray-700">Nombres:</span> {reservaSeleccionada.nombres} {reservaSeleccionada.apellidos}</p>
                        <p><span className="font-semibold text-gray-700">Correo:</span> {reservaSeleccionada.correo}</p>
                        <p><span className="font-semibold text-gray-700">Celular:</span> {reservaSeleccionada.celular}</p>
                        <p><span className="font-semibold text-gray-700">Cédula:</span> {reservaSeleccionada.cedula}</p>
                        <p><span className="font-semibold text-gray-700">Motivo del evento:</span> {reservaSeleccionada.motivoEvento}</p>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex flex-col gap-1 text-sm text-gray-600">
                        <p className="font-semibold text-gray-700">Datos bancarios</p>
                        <p><span className="font-semibold text-gray-700">Banco:</span> {reservaSeleccionada.bancoNombre}</p>
                        <p><span className="font-semibold text-gray-700">Número de cuenta:</span> {reservaSeleccionada.numeroCuenta}</p>
                        <p><span className="font-semibold text-gray-700">Tipo de cuenta:</span> {reservaSeleccionada.tipoCuenta === 'AHORROS' ? 'Ahorros' : 'Corriente'}</p>
                        <p><span className="font-semibold text-gray-700">Cédula/RUC:</span> {reservaSeleccionada.cedulaRucBancario}</p>
                    </div>

                    <hr className="border-gray-200" />

                    <div className="flex flex-col gap-2">
                        <p className="font-semibold text-gray-700 text-sm">Documentos</p>
                        {listaArchivos(reservaSeleccionada.comprobantePagoUrls, 'Comprobante de pago')}
                        {listaArchivos(reservaSeleccionada.listaInvitadosUrls, 'Lista de invitados')}
                        {listaArchivos(reservaSeleccionada.contratoFirmadoUrls, 'Contrato firmado')}
                    </div>

                    <hr className="border-gray-200" />

                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 flex flex-col gap-1">
                        <p>Alquiler: ${Number(reservaSeleccionada.montoAlquiler)}</p>
                        <p>Garantía: ${Number(reservaSeleccionada.montoGarantia)}</p>
                        <p className="font-bold text-volare-azul">
                            Total: ${Number(reservaSeleccionada.montoAlquiler) + Number(reservaSeleccionada.montoGarantia)}
                        </p>
                    </div>
                </Modal>
            )}

            {modalTexto && (
                <Modal onClose={() => setModalTexto(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">
                        {modalTexto.tipo === 'observacion' ? 'Observación del administrador' : 'Motivo de rechazo'}
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                        {modalTexto.texto}
                    </p>
                    {modalTexto.tipo === 'observacion' && (
                        <button
                            type="button"
                            onClick={() => navigate(`/reservas/editar/${modalTexto.reservaId}`)}
                            className="self-start bg-volare-azul text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                        >
                            Ir a corregir mi reserva
                        </button>
                    )}
                </Modal>
            )}
        </div>
    )
}

export default MisReservas
