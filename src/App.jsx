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
            </Routes>
            <BotonSugerencia />
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App