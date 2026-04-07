import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import MainPage from './pages/MainPage'
import SupportPage from './pages/SupportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/main-map" element={<MainPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/dispatch" element={<Navigate to="/dashboard?view=dashboard" replace />} />
      <Route path="/history" element={<Navigate to="/dashboard?view=history" replace />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
  )
}
