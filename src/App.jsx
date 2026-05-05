import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/AppLayout/AppLayout'
import Login from './pages/Login/Login'
import NurseDashboard from './pages/NurseDashboard/NurseDashboard'
import PatientDetail from './pages/PatientDetail/PatientDetail'
import './styles/theme.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes — share AppLayout (Sidebar + Header) */}
          <Route element={<AppLayout />}>
            <Route path="/nurse-dashboard" element={<NurseDashboard />} />
            <Route path="/patient/:id"     element={<PatientDetail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
