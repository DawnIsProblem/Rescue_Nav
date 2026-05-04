import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import MainPage from './pages/MainPage'
import PrivacyPage from './pages/PrivacyPage'
import SupportPage from './pages/SupportPage'
import TermsPage from './pages/TermsPage'
import { AppLanguageProvider } from './lib/appLanguage'

export default function App() {
  return (
    <AppLanguageProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main-map" element={<MainPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dispatch" element={<Navigate to="/dashboard?view=dashboard" replace />} />
        <Route path="/history" element={<Navigate to="/dashboard?view=history" replace />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </AppLanguageProvider>
  )
}
