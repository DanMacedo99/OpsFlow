import { Route, Routes } from 'react-router-dom'
import SuppliersPage from './pages/SuppliersPage'
import AssessmentsPage from './pages/AssessmentsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import Sidebar from './components/layout/Sidebar'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar />

      <main
        id="main-content"
        className="main-content"
        tabIndex={-1}
      >
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App