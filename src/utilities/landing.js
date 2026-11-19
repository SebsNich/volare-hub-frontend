// Contenido y lógica de la página pública (RF-03 y RF-04). Solo texto general:
// nada de correos, teléfonos ni cuentas, porque cualquiera puede ver esta página.

const MODOS_DESDE_AFUERA = ['login', 'registro']

// El modal de acceso se puede abrir en el registro (RF-03). Lo desconocido abre
// el inicio de sesión, que es lo más común.
export function modoInicialAuth(modo) {
    return MODOS_DESDE_AFUERA.includes(modo) ? modo : 'login'
}

// Quien ya inició sesión no necesita "registrarme" ni "iniciar sesión".
export function mostrarLlamadosAccion(usuario) {
    return !usuario
}

export const PASOS_COMO_FUNCIONA = Object.freeze([
    {
        clave: 'registro',
        titulo: 'Regístrate como propietario',
        descripcion: 'Completa tus datos, tu manzana y tu villa. Solo pueden registrarse propietarios y residentes de la urbanización.'
    },
    {
        clave: 'verificacion',
        titulo: 'La administración verifica tu cuenta',
        descripcion: 'Revisamos que tus datos correspondan a la urbanización. Mientras tanto, tu cuenta queda pendiente de aprobación.'
    },
    {
        clave: 'acceso',
        titulo: 'Ingresa y usa los servicios',
        descripcion: 'Cuando tu cuenta esté aprobada, inicia sesión con tu correo y contraseña para acceder a todo.'
    }
])

export const SERVICIOS_DISPONIBLES = Object.freeze([
    { titulo: 'Reservas', descripcion: 'Reserva las cabañas y la Casa Club, y revisa la disponibilidad en el calendario.' },
    // Sin "en línea": en producción todavía no hay proveedor de pago real.
    { titulo: 'Pagos', descripcion: 'Registra el pago del alquiler de tu reserva desde la plataforma.' },
    { titulo: 'Comunidad', descripcion: 'Lee las noticias de la administración y las publicaciones de los vecinos.' },
    { titulo: 'Buzón de sugerencias', descripcion: 'Envía tus ideas y comentarios a la administración.' }
])
