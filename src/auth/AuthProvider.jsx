import { useCallback, useMemo, useState } from 'react'
import api from '../api/client'
import { AuthContext } from './AuthContext'

const CLAVE = 'lamar_sesion'

function leerSesion() {
    try {
        const raw = localStorage.getItem(CLAVE)
        if (!raw) return null
        const s = JSON.parse(raw)
        if (!s.token || Date.now() > s.expiraEn) {
            localStorage.removeItem(CLAVE)
            return null
        }
        return s
    } catch {
        return null
    }
}

export default function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(leerSesion)

    const login = useCallback(async (usuario, password) => {
        const { data } = await api.post('/auth/login', { usuario, password })
        const s = {
            token: data.token,
            idEmpleado: data.idEmpleado,
            nombres: data.nombres,
            apellidos: data.apellidos,
            cargo: data.cargo,
            expiraEn: Date.now() + data.expiraEnMinutos * 60 * 1000,
        }
        localStorage.setItem(CLAVE, JSON.stringify(s))
        setSesion(s)
        return s
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem(CLAVE)
        setSesion(null)
    }, [])

    const value = useMemo(() => ({ sesion, login, logout }), [sesion, login, logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}