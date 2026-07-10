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

export { tipoColores, NOMBRES_ESPACIO_RESERVA, NOMBRES_HORARIO_RESERVA, ESTILOS_ESTADO_RESERVA }
