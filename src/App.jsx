import { Navigate, Route, Routes } from 'react-router'
import { INICIO, ROLES } from './auth/roles'
import { useAuth } from './auth/useAuth'
import Layout from './components/Layout'
import EnConstruccion from './pages/EnConstruccion'
import Login from './pages/Login'
import Mesas from './pages/Mesas'
import RutaProtegida from './routes/RutaProtegida'
import Pedido from './pages/Pedido'

export default function App() {
  const { sesion } = useAuth()
  const inicio = sesion ? (INICIO[sesion.cargo] ?? '/mesas') : '/login'

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RutaProtegida />}>
        <Route element={<Layout />}>
          <Route path="/mesas" element={<Mesas />} />

          <Route element={<RutaProtegida roles={[ROLES.MOZO, ROLES.ADMIN]} />}>
            <Route path="/pedido/:idMesa" element={<Pedido />} />
          </Route>

          <Route element={<RutaProtegida roles={[ROLES.RECEPCIONISTA, ROLES.ADMIN]} />}>
            <Route path="/reservas" element={<EnConstruccion titulo="Reservas" />} />
          </Route>

          <Route element={<RutaProtegida roles={[ROLES.ADMIN]} />}>
            <Route path="/abastecimiento" element={<EnConstruccion titulo="Abastecimiento" />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={inicio} replace />} />
    </Routes>
  )
}