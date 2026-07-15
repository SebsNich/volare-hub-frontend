import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok, FaXTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa6'
import { HiOutlineGlobeAlt } from 'react-icons/hi2'

const PLATAFORMAS_RED_SOCIAL = [
    { value: 'FACEBOOK', label: 'Facebook', icono: FaFacebook },
    { value: 'INSTAGRAM', label: 'Instagram', icono: FaInstagram },
    { value: 'WHATSAPP', label: 'WhatsApp', icono: FaWhatsapp },
    { value: 'TIKTOK', label: 'TikTok', icono: FaTiktok },
    { value: 'TWITTER', label: 'Twitter/X', icono: FaXTwitter },
    { value: 'YOUTUBE', label: 'YouTube', icono: FaYoutube },
    { value: 'LINKEDIN', label: 'LinkedIn', icono: FaLinkedin },
    { value: 'OTRO', label: 'Otro', icono: HiOutlineGlobeAlt },
]

const ICONO_PLATAFORMA = Object.fromEntries(PLATAFORMAS_RED_SOCIAL.map(p => [p.value, p.icono]))

const tipoColores = {
    AVISO: 'bg-volare-naranja',
    OBRA: 'bg-volare-azul',
    COMUNICADO: 'bg-volare-morado',
    EMPRENDIMIENTO: 'bg-volare-verde',
}

const NOMBRES_ESPACIO_RESERVA = {
    CABANA_ARBOL: 'Cabaña Árbol',
    CABANA_MEDIO: 'Cabaña Medio',
    CABANA_RIO: 'Cabaña Río',
    CASA_CLUB: 'Casa Club'
}

const NOMBRES_HORARIO_RESERVA = {
    CABANA_COMPLETO: 'Día completo (10:00 a 18:00)',
    CASA_CLUB_MATUTINO: 'Matutino (09:00 a 13:00)',
    CASA_CLUB_VESPERTINO: 'Vespertino (14:00 a 18:00)',
    CASA_CLUB_NOCTURNO: 'Nocturno (19:00 a 02:00)'
}

const ESTILOS_ESTADO_RESERVA = {
    PENDIENTE: { color: 'text-volare-naranja', punto: 'bg-volare-naranja', label: 'Pendiente' },
    APROBADA: { color: 'text-volare-verde', punto: 'bg-volare-verde', label: 'Aprobada' },
    RECHAZADA: { color: 'text-red-500', punto: 'bg-red-500', label: 'Rechazada' },
}

const BANCOS_ECUADOR = [
    'Banco Pichincha', 'Banco del Pacífico', 'Banco de Guayaquil',
    'Produbanco', 'Banco Internacional', 'Banco Bolivariano',
    'Banco del Austro', 'Banco Solidario', 'Banco Promerica',
    'Banco Amazonas', 'Banco ProCredit', 'Banco de Loja',
    'Banco de Machala', 'Banco del Litoral', 'Banco General Rumiñahui',
    'Banco Comercial de Manabí', 'Banco D-Miro', 'Banisi / Delbank',
    'Banco Capital', 'Citibank (Sucursal Internacional)'
]

export { tipoColores, NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA, BANCOS_ECUADOR, PLATAFORMAS_RED_SOCIAL, ICONO_PLATAFORMA }
