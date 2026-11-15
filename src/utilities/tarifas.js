// Los precios viven solo en el backend (GET /api/reservas/tarifas). Aquí solo se
// busca el precio en esa tabla: si algo no está, se devuelve null en vez de
// adivinar, para no mostrar un total que el servidor no va a cobrar.
export function montosDeTarifa(tabla, espacio, horario, esParaTercero) {
    const celda = tabla?.[espacio]?.[horario]?.[esParaTercero ? 'tercero' : 'residente']
    if (!celda) return null
    const { alquilerCentavos, garantiaCentavos } = celda
    return { alquilerCentavos, garantiaCentavos, totalCentavos: alquilerCentavos + garantiaCentavos }
}

// Muestra "15" para 1500 y "80.50" para 8050: igual que antes con los precios redondos.
export function formatearDolares(centavos) {
    return centavos % 100 === 0 ? String(centavos / 100) : (centavos / 100).toFixed(2)
}
