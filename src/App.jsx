import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/AppLayout/AppLayout'
import Login from './pages/Login/Login'
import NurseDashboard from './pages/NurseDashboard/NurseDashboard'
import PatientDetail from './pages/PatientDetail/PatientDetail'
import TaskMaster from './pages/TaskMaster/TaskMaster'
import TaskGroup from './pages/TaskGroup/TaskGroup'
import Alerts from './pages/Alerts/Alerts'
import VitalMetrics from './pages/VitalMetrics/VitalMetrics'
import './styles/theme.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/nurse-dashboard" element={<NurseDashboard />} />
            <Route path="/patient/:id"     element={<PatientDetail />} />
            <Route path="/task-master"     element={<TaskMaster />} />
            <Route path="/task-groups"     element={<TaskGroup />} />
            <Route path="/alerts"          element={<Alerts />} />
            <Route path="/vital-metrics"   element={<VitalMetrics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
