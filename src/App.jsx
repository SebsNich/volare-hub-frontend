import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
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
import RestablecerContrasena from './pages/RestablecerContrasena'
import PagarReserva from './pages/PagarReserva'
import RetornoPago from './pages/RetornoPago'

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/feed" element={
                    <RutaProtegida>
                        <Feed />
                    </RutaProtegida>
                } />
                <Route path="/restablecer-contrasena" element={<RestablecerContrasena />} />
                <Route path="/perfil/:id" element={
                    <RutaProtegida>
                        <PerfilPublico />
                    </RutaProtegida>
                } />
                <Route path="/admin" element={
                  <RutaProtegida rolRequerido="ADMIN">
                      <Admin />
                  </RutaProtegida>
              } />
              <Route path="/reservas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <Reservas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/cabanas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <ReservaCabanas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/casa-club" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <ReservaCasaClub />
                  </RutaProtegida>
              } />
              <Route path="/reservas/cabanas/formulario" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/casa-club/formulario" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/editar/:id" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <ReservaFormulario />
                  </RutaProtegida>
              } />
              <Route path="/reservas/mis-reservas" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <MisReservas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/:id/pagar" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <PagarReserva />
                  </RutaProtegida>
              } />
              <Route path="/pagos/retorno" element={
                  <RutaProtegida rolRequerido={['RESIDENTE', 'ADMIN']} soloAprobadas>
                      <RetornoPago />
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