import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Registro from './pages/registro'
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

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/login" element={<Login />} />
                <Route path='/registro' element={<Registro />}/>
                <Route path="/perfil/:id" element={<PerfilPublico />} />
                <Route path="/admin" element={
                  <RutaProtegida rolRequerido="ADMIN">
                      <Admin />
                  </RutaProtegida>
              } />
              <Route path="/reservas" element={
                  <RutaProtegida rolRequerido="RESIDENTE">
                      <Reservas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/cabanas" element={
                  <RutaProtegida rolRequerido="RESIDENTE">
                      <ReservaCabanas />
                  </RutaProtegida>
              } />
              <Route path="/reservas/casa-club" element={
                  <RutaProtegida rolRequerido="RESIDENTE">
                      <ReservaCasaClub />
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