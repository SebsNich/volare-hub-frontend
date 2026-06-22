import { createContext, useState, useEffect } from 'react'

const AuthContext = createContext()

function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null)

    useEffect(() => {
        async function verificarSesion() {
            const token = localStorage.getItem('token')

            if (token) {
                const peticion = await fetch('http://localhost:3000/api/auth/perfil', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                const datos = await peticion.json()
                setUsuario(datos.user)
                console.log(datos.user)
            }
        }
        verificarSesion()
    }, [])

    return (
        <AuthContext.Provider value={{ usuario, setUsuario }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider }