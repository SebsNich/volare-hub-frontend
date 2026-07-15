import { HiOutlineClipboard } from 'react-icons/hi2'
import { useToast } from '../context/ToastContext'

const CUENTAS = [
    {
        id: 'guayaquil',
        banco: 'Banco Guayaquil',
        logo: '/bancos/guayaquil.png',
        colorBanda: '#D2006E',
        titular: 'Asoc. Prop. Urb. "Volare"',
        cuenta: '0027766889',
        ruc: '0992759836001',
        correo: 'contabilidad@urbvolare.com'
    },
    {
        id: 'internacional',
        banco: 'Banco Internacional',
        logo: '/bancos/internacional.png',
        colorBanda: '#FF8F00',
        titular: 'Asoc. Prop. Urb. "Volare"',
        cuenta: '1400610160',
        ruc: '0992759836001',
        correo: 'contabilidad@urbvolare.com'
    }
]

function TarjetaBanco({ cuenta }) {
    const { mostrarToast } = useToast()

    async function copiarCuenta() {
        await navigator.clipboard.writeText(cuenta.cuenta)
        mostrarToast('Número de cuenta copiado', 'exito')
    }

    return (
        <div className="flex-1 rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div
                className="flex flex-col items-center gap-2 py-5 px-4"
                style={{ backgroundColor: cuenta.colorBanda }}
            >
                <div className="w-16 h-16 rounded-full bg-white p-1.5 shadow-sm shrink-0">
                    <img src={cuenta.logo} alt={cuenta.banco} className="w-full h-full object-contain rounded-full" />
                </div>
                <span className="font-bold text-white text-center leading-tight">{cuenta.banco}</span>
            </div>
            <div className="bg-white p-4 flex flex-col gap-1 text-sm text-gray-700">
                <p>{cuenta.titular}</p>
                <div className="flex items-center gap-2">
                    <p>
                        <span className="font-semibold">Cta. Cte.:</span> {cuenta.cuenta}
                    </p>
                    <button
                        type="button"
                        onClick={copiarCuenta}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-volare-azul hover:bg-gray-100 transition shrink-0"
                        aria-label="Copiar número de cuenta"
                    >
                        <HiOutlineClipboard size={16} />
                    </button>
                </div>
                <p><span className="font-semibold">RUC:</span> {cuenta.ruc}</p>
                <p><span className="font-semibold">Correo:</span> {cuenta.correo}</p>
            </div>
        </div>
    )
}

function CuentasBancarias() {
    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {CUENTAS.map(cuenta => (
                <TarjetaBanco key={cuenta.id} cuenta={cuenta} />
            ))}
        </div>
    )
}

export default CuentasBancarias
