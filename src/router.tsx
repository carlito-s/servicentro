import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { PublicLayout } from '@/layouts/PublicLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { TurnsAdmin } from '@/pages/TurnsAdmin'
import { ReservationsAdmin } from '@/pages/ReservationsAdmin'
import { AvailableTurns } from '@/pages/AvailableTurns'
import App from './App'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<App />} />
            <Route path="/turnos" element={<AvailableTurns />} />
          </Route>
          
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-surface-dim">
                  <Outlet />
                </div>
              </ProtectedRoute>
            }
          >
            <Route path="turns" element={<TurnsAdmin />} />
            <Route path="reservations" element={<ReservationsAdmin />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}