import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

// Agrega el token a cada peticion
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('lamar_sesion')
  if (raw) {
    try {
      config.headers.Authorization = `Bearer ${JSON.parse(raw).token}`
    } catch {
      // sesion corrupta: se ignora
    }
  }
  return config
})

// Si el token vencio o no es valido, vuelve al login
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem('lamar_sesion')
      window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

export default api