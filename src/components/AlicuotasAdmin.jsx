import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'
import { API_URL } from '../config/api'
import { formatearDolares } from '../utilities/tarifas'
import { etiquetaCasa } from '../utilities/perfil'
import { nombrePeriodo, estadoCuota, dolaresParaInput } from '../utilities/alicuotas'
import { DecisionTransferencia } from './PagosReservaAdmin'
import ArchivoAdjunto from './ArchivoAdjunto'

const encabezados = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' })
const COLOR_TONO = { exito: 'bg-green-100 text-green-800', aviso: 'bg-yellow-100 text-yellow-800', neutro: 'bg-gray-100 text-gray-600' }
const mesActual = () => new Date().toISOString().slice(0, 7)

async function pedir(ruta, opciones) {
    const respuesta = await fetch(`${API_URL}/api/alicuotas${ruta}`, { headers: encabezados(), ...opciones })
    const cuerpo = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) throw new Error(cuerpo.error || 'No se pudo completar la operación')
    return cuerpo
}

// Montos vigentes: lo que el administrador cambia aquí vale para las cuotas que se generen desde ahora.
function ConfiguracionAlicuotas() {
    const { mostrarToast } = useToast()
    const [form, setForm] = useState(null)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        pedir('/config')
            .then(({ config }) => setForm({
                monto: dolaresParaInput(config.montoCentavos),
                montoPuntual: dolaresParaInput(config.montoPuntualCentavos),
                diasPuntual: String(config.diasPuntual)
            }))
            .catch((falla) => mostrarToast(falla.message, 'error'))
    }, [mostrarToast])

    async function guardar(evento) {
        evento.preventDefault()
        setGuardando(true)
        try {
            await pedir('/config', { method: 'PUT', body: JSON.stringify(form) })
            mostrarToast('Montos guardados. Valen para las cuotas que se generen desde ahora.', 'exito')
        } catch (falla) {
            mostrarToast(falla.message, 'error')
        } finally {
            setGuardando(false)
        }
    }

    if (!form) return <p className="text-sm text-gray-500">Cargando configuración…</p>
    const campo = 'border border-gray-300 rounded-lg px-3 py-2 text-sm w-full'
    return (
        <form onSubmit={guardar} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end" aria-label="Configuración de alícuotas">
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                Alícuota mensual (USD)
                <input className={campo} inputMode="decimal" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                Si paga a tiempo (USD)
                <input className={campo} inputMode="decimal" value={form.montoPuntual} onChange={(e) => setForm({ ...form, montoPuntual: e.target.value })} />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                Días del mes para pagar a tiempo
                <input className={campo} inputMode="numeric" value={form.diasPuntual} onChange={(e) => setForm({ ...form, diasPuntual: e.target.value })} />
            </label>
            <p className="sm:col-span-3 text-xs text-gray-500">
                Valor fijo mensual: no hay recargo por mora. Pagar del día 1 al día indicado cuesta el monto "a tiempo"; después, el monto mensual.
            </p>
            <button type="submit" disabled={guardando} className="sm:col-span-3 sm:justify-self-start bg-volare-azul text-white px-5 py-2 rounded-lg font-semibold disabled:opacity-50">
                {guardando ? 'Guardando…' : 'Guardar montos'}
            </button>
        </form>
    )
}

function AlicuotasAdmin() {
    const { mostrarToast } = useToast()
    const [periodo, setPeriodo] = useState(mesActual())
    const [estado, setEstado] = useState('TODOS')
    const [cuotas, setCuotas] = useState(null)
    const [generando, setGenerando] = useState(false)

    const cargar = useCallback(() => {
        const consulta = new URLSearchParams()
        if (periodo) consulta.set('periodo', periodo)
        if (estado !== 'TODOS') consulta.set('estado', estado)
        pedir(`?${consulta}`)
            .then(({ cuotas: lista }) => setCuotas(lista))
            .catch((falla) => mostrarToast(falla.message, 'error'))
    }, [periodo, estado, mostrarToast])

    useEffect(() => { cargar() }, [cargar])

    async function generar() {
        setGenerando(true)
        try {
            const r = await pedir('/generar', { method: 'POST', body: JSON.stringify({ periodo }) })
            mostrarToast(`${nombrePeriodo(r.periodo)}: ${r.creadas} cuotas nuevas, ${r.yaExistian} ya existían.`, 'exito')
            cargar()
        } catch (falla) {
            mostrarToast(falla.message, 'error')
        } finally {
            setGenerando(false)
        }
    }

    async function anular(cuota) {
        try {
            await pedir(`/${cuota.id}/anular`, { method: 'POST' })
            mostrarToast('Cuota anulada', 'exito')
            cargar()
        } catch (falla) {
            mostrarToast(falla.message, 'error')
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-3">
                <h3 className="text-lg font-bold text-gray-800">Montos de la alícuota</h3>
                <ConfiguracionAlicuotas />
            </section>

            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-end gap-3">
                    <h3 className="text-lg font-bold text-gray-800 w-full">Cuotas por villa</h3>
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                        Mes
                        <input type="month" value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                        Estado
                        <select value={estado} onChange={(e) => setEstado(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                            <option value="TODOS">Todos</option>
                            <option value="PENDIENTE">Pendientes</option>
                            <option value="PAGADA">Pagadas</option>
                            <option value="ANULADA">Anuladas</option>
                        </select>
                    </label>
                    <button type="button" onClick={generar} disabled={generando || !periodo} className="bg-volare-verde text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                        {generando ? 'Generando…' : `Generar cuotas de ${periodo ? nombrePeriodo(periodo) : 'este mes'}`}
                    </button>
                </div>

                {cuotas === null && <p className="text-sm text-gray-500">Cargando…</p>}
                {cuotas?.length === 0 && <p className="text-sm text-gray-500">No hay cuotas con esos filtros. Usa "Generar cuotas" para crear las del mes.</p>}
                {cuotas?.length > 0 && (
                    <ul className="flex flex-col divide-y divide-gray-100">
                        {cuotas.map(cuota => {
                            const { texto, tono } = estadoCuota(cuota)
                            return (
                                <li key={cuota.id} className="py-3 flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                        <span className="font-semibold text-gray-800">{etiquetaCasa(cuota.manzana, cuota.villa)}</span>
                                        <span className="text-gray-500">{nombrePeriodo(cuota.periodo)}</span>
                                        <span className="text-gray-600">${formatearDolares(cuota.montoBaseCentavos)} / ${formatearDolares(cuota.montoPuntualCentavos)} (hasta el día {cuota.diasPuntual})</span>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${COLOR_TONO[tono]}`}>{texto}</span>
                                        {cuota.pagado && <span className="text-xs text-gray-500">Pagó ${formatearDolares(cuota.pagado.montoCentavos)}</span>}
                                        {cuota.estado === 'PENDIENTE' && !cuota.transferenciaEnRevision && (
                                            <button type="button" onClick={() => anular(cuota)} className="ml-auto text-xs text-red-600 hover:underline">Anular</button>
                                        )}
                                    </div>
                                    {cuota.pagos?.map(pago => (
                                        <div key={pago.id} className="rounded-lg bg-gray-50 px-3 py-2 flex flex-col gap-1 text-sm">
                                            <span className="font-semibold text-gray-700">Transferencia por ${formatearDolares(pago.montoCentavos)} en revisión</span>
                                            {pago.evidenciaUrls.map((url, i) => (
                                                <ArchivoAdjunto key={url} nombre={`Comprobante ${i + 1}`} href={url} />
                                            ))}
                                            <DecisionTransferencia pagoId={pago.id} conReserva={false} onDecidido={cargar} />
                                        </div>
                                    ))}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </div>
    )
}

export default AlicuotasAdmin
