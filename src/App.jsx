import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import PerfilPublico from './pages/PerfilPublico'
import Admin from './pages/Admin'
import RutaProtegida from './components/RutaProtegida'
import BotonSugerencia from './components/BotonSugerencia'
import Reservas from './pages/Reservas'
import ReservaCabanas from './pages/ReservaCabanas'
import ReservaCasaClub from './pages/ReservaCasaClub'
import ReservaFormulario from './pages/ReservaFormulario'
import MisReservas from './pages/MisReservas'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/perfil/:id" element={<PerfilPublico />} />
                <Route path="/admin" element={
                  <RutaProtegida rolRequerido="ADMIN">
                      <Admin />
                  </RutaProtegida>
              } />
              <Route path="/reservas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <Reservas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/cabanas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <ReservaCabanas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/casa-club" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <ReservaCasaClub />
                  </RutaProtegida>
              } />
              <Route path="/reservas/cabanas/formulario" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/casa-club/formulario" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/editar/:id" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/mis-reservas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']}>
                      <MisReservas />
                  </RutaProtegida>
              } />
            </Routes>
            <BotonSugerencia />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App