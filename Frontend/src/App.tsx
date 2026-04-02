import { Routes, Route } from 'react-router'
import LandingPage from './pages/LandingPage'
import DispatchPage from './pages/DispatchPage'
import HistoryPage from './pages/HistoryPage'
import SupportPage from './pages/SupportPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dispatch" element={<DispatchPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/support" element={<SupportPage />} />
    </Routes>
  )
}