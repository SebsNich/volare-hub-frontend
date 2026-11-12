import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'
import ControlesPaginacion from './ControlesPaginacion'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { nombreCompleto } from '../utilities/helpers'

// Solo para mostrar el cupo; quien hace cumplir el límite es el backend.
const LIMITE_CUENTAS_POR_CASA = 2
// Igual que en el backend; aquí solo evita escribir de más.
const LARGO_MAXIMO_MOTIVO = 500

// Con estos códigos el modal sigue abierto: la solicitud no cambió y el ADMIN
// puede corregir el motivo o volver a pulsar. Con los demás (otro admin ya
// decidió, la cuenta no existe) la lista está desactualizada y se recarga.
const CODIGOS_QUE_CONSERVAN_MODAL = ['REINTENTAR', 'MOTIVO_INVALIDO']

function formatearFechaSolicitud(fecha) {
    return new Date(fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })
}

// cuentasEnCasa incluye a la propia solicitud (una pendiente ya ocupa cupo).
// En rojo cuando la casa está completa, para que el ADMIN revise antes de decidir.
function EtiquetaCupo({ cuentasEnCasa }) {
    const completa = cuentasEnCasa >= LIMITE_CUENTAS_POR_CASA
    return (
        <span
            title="Cuentas de residentes pendientes o aprobadas en esta casa, incluida esta solicitud"
            className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${completa ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}
        >
            {cuentasEnCasa}/{LIMITE_CUENTAS_POR_CASA} en la casa
        </span>
    )
}

function BotonesDecision({ solicitud, onAprobar, onRechazar, deshabilitado }) {
    return (
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => onAprobar(solicitud)}
                disabled={deshabilitado}
                className="bg-volare-verde text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Aprobar
            </button>
            <button
                type="button"
                onClick={() => onRechazar(solicitud)}
                disabled={deshabilitado}
                className="border border-red-500 text-red-500 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Rechazar
            </button>
        </div>
    )
}

function SolicitudesPendientes({ onDecision }) {
    const { mostrarToast } = useToast()
    const [solicitudes, setSolicitudes] = useState([])
    const [total, setTotal] = useState(0)
    const [pagina, setPagina] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1)
    const [errorCarga, setErrorCarga] = useState('')
    const [solicitudAAprobar, setSolicitudAAprobar] = useState(null)
    const [solicitudARechazar, setSolicitudARechazar] = useState(null)
    const [motivoRechazo, setMotivoRechazo] = useState('')
    const [enviando, setEnviando] = useState(false)

    const cargarSolicitudes = useCallback(async () => {
        try {
            const respuesta = await fetch(`${API_URL}/api/usuarios/pendientes?pagina=${pagina}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const datos = await respuesta.json().catch(() => ({}))
            if (!respuesta.ok) {
                setErrorCarga(datos.mensaje || 'No se pudieron cargar las solicitudes')
                return
            }
            setErrorCarga('')
            setSolicitudes(datos.usuarios)
            setTotal(datos.total)
            setTotalPaginas(datos.totalPaginas)
        } catch {
            setErrorCarga('No se pudo conectar con el servidor')
        }
    }, [pagina])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarSolicitudes()
    }, [cargarSolicitudes])

    // Tras decidir, la solicitud sale de la lista. Si era la última de la
    // página, se vuelve a la anterior para no mostrar una página vacía.
    function recargarTrasDecision() {
        if (solicitudes.length === 1 && pagina > 1) {
            setPagina(pagina - 1)
        } else {
            cargarSolicitudes()
        }
        onDecision?.()
    }

    async function aprobar() {
        setEnviando(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/usuarios/${solicitudAAprobar.id}/aprobar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            const datos = await respuesta.json().catch(() => ({}))
            if (respuesta.ok) {
                mostrarToast(`Cuenta de ${nombreCompleto(solicitudAAprobar)} aprobada`, 'exito')
                setSolicitudAAprobar(null)
                recargarTrasDecision()
                return
            }
            mostrarToast(datos.mensaje || 'No se pudo aprobar la cuenta', 'error')
            if (!CODIGOS_QUE_CONSERVAN_MODAL.includes(datos.codigo)) {
                setSolicitudAAprobar(null)
                recargarTrasDecision()
            }
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setEnviando(false)
        }
    }

    function abrirRechazo(solicitud) {
        setMotivoRechazo('')
        setSolicitudARechazar(solicitud)
    }

    async function rechazar() {
        if (!motivoRechazo.trim()) {
            mostrarToast('Debes indicar el motivo del rechazo', 'error')
            return
        }
        setEnviando(true)
        try {
            const respuesta = await fetch(`${API_URL}/api/usuarios/${solicitudARechazar.id}/rechazar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ motivo: motivoRechazo })
            })
            const datos = await respuesta.json().catch(() => ({}))
            if (respuesta.ok) {
                mostrarToast(`Solicitud de ${nombreCompleto(solicitudARechazar)} rechazada`, 'exito')
                setSolicitudARechazar(null)
                recargarTrasDecision()
                return
            }
            mostrarToast(datos.mensaje || 'No se pudo rechazar la solicitud', 'error')
            if (!CODIGOS_QUE_CONSERVAN_MODAL.includes(datos.codigo)) {
                setSolicitudARechazar(null)
                recargarTrasDecision()
            }
        } catch {
            mostrarToast('No se pudo conectar con el servidor', 'error')
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-volare-azul">Solicitudes de registro</h2>
                {total > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-volare-naranja">{total}</span>
                )}
            </div>

            {errorCarga && <p className="px-4 py-6 text-center text-sm text-red-500">{errorCarga}</p>}

            {!errorCarga && solicitudes.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-gray-400">No hay solicitudes pendientes</p>
            )}

            {!errorCarga && solicitudes.length > 0 && (
                <>
                    {/* Escritorio: tabla. Los datos van apilados de a dos (cédula/celular,
                        casa/cupo) para que quepa junto al menú lateral sin scroll horizontal.
                        Necesita unos 620 px, que junto al menú solo hay desde lg; debajo, tarjetas. */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                                    <th className="px-3 py-3 whitespace-nowrap">Solicitante</th>
                                    <th className="px-3 py-3 whitespace-nowrap">Contacto</th>
                                    <th className="px-3 py-3 whitespace-nowrap">Casa</th>
                                    <th className="px-3 py-3 whitespace-nowrap">Solicitada</th>
                                    <th className="px-3 py-3 whitespace-nowrap">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(solicitud => (
                                    <tr key={solicitud.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                        <td className="px-3 py-3">
                                            <p className="font-semibold text-volare-azul">{nombreCompleto(solicitud)}</p>
                                            <p className="text-xs text-gray-500 break-all">{solicitud.email}</p>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">
                                            <p>CI {solicitud.cedula}</p>
                                            <p className="text-xs">Cel. {solicitud.celular}</p>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">
                                            <p className="whitespace-nowrap mb-1">Mz. {solicitud.manzana} Villa {solicitud.villa}</p>
                                            <EtiquetaCupo cuentasEnCasa={solicitud.cuentasEnCasa} />
                                        </td>
                                        <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{formatearFechaSolicitud(solicitud.creadoEn)}</td>
                                        <td className="px-3 py-3">
                                            <BotonesDecision solicitud={solicitud} onAprobar={setSolicitudAAprobar} onRechazar={abrirRechazo} deshabilitado={enviando} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="lg:hidden flex flex-col divide-y divide-gray-100">
                        {solicitudes.map(solicitud => (
                            <div key={solicitud.id} className="px-4 py-3 flex flex-col gap-2">
                                <div>
                                    <p className="font-semibold text-volare-azul">{nombreCompleto(solicitud)}</p>
                                    <p className="text-xs text-gray-500 break-all">{solicitud.email}</p>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Cédula {solicitud.cedula} · Cel. {solicitud.celular}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                    <span>Mz. {solicitud.manzana} Villa {solicitud.villa}</span>
                                    <EtiquetaCupo cuentasEnCasa={solicitud.cuentasEnCasa} />
                                </div>
                                <p className="text-xs text-gray-400">Solicitada el {formatearFechaSolicitud(solicitud.creadoEn)}</p>
                                <BotonesDecision solicitud={solicitud} onAprobar={setSolicitudAAprobar} onRechazar={abrirRechazo} deshabilitado={enviando} />
                            </div>
                        ))}
                    </div>

                    {totalPaginas > 1 && (
                        <ControlesPaginacion
                            paginaActual={pagina}
                            totalPaginas={totalPaginas}
                            onAnterior={() => setPagina(pagina - 1)}
                            onSiguiente={() => setPagina(pagina + 1)}
                        />
                    )}
                </>
            )}

            {solicitudAAprobar && (
                <Modal onClose={() => !enviando && setSolicitudAAprobar(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">Confirmar aprobación</h3>
                    <p className="text-sm text-gray-600">
                        ¿Aprobar la cuenta de <strong>{nombreCompleto(solicitudAAprobar)}</strong> (Mz. {solicitudAAprobar.manzana}, Villa {solicitudAAprobar.villa})?
                        Podrá publicar y hacer reservas.
                    </p>
                    <div className="flex gap-3 self-start">
                        <button
                            type="button"
                            onClick={aprobar}
                            disabled={enviando}
                            className="bg-volare-verde text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enviando ? 'Aprobando...' : 'Sí, aprobar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSolicitudAAprobar(null)}
                            disabled={enviando}
                            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </Modal>
            )}

            {solicitudARechazar && (
                <Modal onClose={() => !enviando && setSolicitudARechazar(null)}>
                    <h3 className="text-lg font-bold text-volare-azul">Rechazar solicitud</h3>
                    <p className="text-sm text-gray-600">
                        Vas a rechazar la solicitud de <strong>{nombreCompleto(solicitudARechazar)}</strong> (Mz. {solicitudARechazar.manzana}, Villa {solicitudARechazar.villa}).
                        Verá este motivo al intentar iniciar sesión.
                    </p>
                    {/* Con foco al abrir: si no, lo primero que se teclea se pierde. */}
                    <textarea
                        autoFocus
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        maxLength={LARGO_MAXIMO_MOTIVO}
                        disabled={enviando}
                        placeholder="Motivo del rechazo (obligatorio)"
                        rows={3}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-volare-azul resize-none disabled:bg-gray-50"
                    />
                    <p className="text-xs text-gray-400 self-end">{motivoRechazo.length}/{LARGO_MAXIMO_MOTIVO}</p>
                    <div className="flex gap-3 self-start">
                        <button
                            type="button"
                            onClick={rechazar}
                            disabled={enviando || !motivoRechazo.trim()}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {enviando ? 'Rechazando...' : 'Sí, rechazar'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSolicitudARechazar(null)}
                            disabled={enviando}
                            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    )
}

export default SolicitudesPendientes
