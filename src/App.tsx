import { Navigate, Route, Routes } from 'react-router-dom'
import { getToken } from './api'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function ProtectedRoute() {
  return getToken() ? <Dashboard /> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
