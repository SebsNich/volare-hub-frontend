# Volare Hub — Frontend

Interfaz web de **Volare Hub**, una plataforma para la gestión de comunicación y reservas de áreas comunes de una urbanización residencial. Este repositorio contiene la aplicación cliente: feed de publicaciones, reservas de espacios comunes y panel de administración.

**🟢 En producción:** [urbvolare.com](https://urbvolare.com)

## Stack Tecnológico

- **React** — construcción de la interfaz por componentes
- **Vite** — entorno de desarrollo y build
- **Tailwind CSS v4** — estilos utilitarios y sistema de diseño
- **React Router** — enrutamiento y rutas protegidas

## Funcionalidades principales

- Diseño responsive completo, con ajustes finales pensados mobile-first
- Sistema de notificaciones toast
- Calendario de disponibilidad construido sin librerías externas
- Wizard multi-paso para reservas de espacios comunes
- Panel administrativo con tablas paginadas y filtros
- Feed de publicaciones con roles diferenciados (residente / administrador)
- Recuperación de contraseña por correo

## Diseño

Paleta de colores personalizada de la marca Volare, aplicada de forma consistente en toda la interfaz. Componentes reutilizables como Modal con Portal, un sistema de drawers para móvil y tooltips propios, pensados para mantener coherencia visual sin depender de librerías de UI externas.

## Arquitectura

Backend y frontend viven en repositorios separados. El frontend se despliega en **Vercel** y consume la API del backend, desplegado en **Render**. La base de datos vive en **Supabase** (PostgreSQL) y los archivos multimedia se almacenan en **Cloudinary**.

## Instalación local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Completar VITE_API_URL apuntando al backend local o desplegado

# 4. Levantar el servidor en modo desarrollo
npm run dev
```

---

Este proyecto fue desarrollado como parte de un internado, aplicando prácticas profesionales de seguridad (validación en backend, principio de menor privilegio en credenciales, auditoría de historial de git) y arquitectura escalable.
