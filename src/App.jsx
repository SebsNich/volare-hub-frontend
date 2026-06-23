import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Feed from './pages/Feed'
import Login from './pages/Login'
import Registro from './pages/registro'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
          <Navbar />
          <Routes>
              <Route path="/" element={<Feed />} />
              <Route path="/login" element={<Login />} />
              <Route path='/registro' element={<Registro />}/>
          </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App