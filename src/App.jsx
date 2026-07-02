import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Registro from './pages/registro'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import PerfilPublico from './pages/PerfilPublico'
import Admin from './pages/Admin'
import RutaProtegida from './components/RutaProtegida'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App