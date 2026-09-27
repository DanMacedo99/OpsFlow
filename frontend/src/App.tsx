import {
  Route,
  Routes,
} from 'react-router-dom'
import PublicRoute from './components/auth/PublicRoute'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'

import AssessmentsPage from './pages/AssessmentsPage'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import SuppliersPage from './pages/SuppliersPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <Routes>
    <Route element={<PublicRoute />}>
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />
    </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            index
            element={<DashboardPage />}
          />

          <Route
            path="suppliers"
            element={<SuppliersPage />}
          />

          <Route
            path="assessments"
            element={<AssessmentsPage />}
          />

          <Route
            path="reports"
            element={<ReportsPage />}
          />

          <Route
            path="settings"
            element={<SettingsPage />}
          />
        </Route>
      </Route>
    </Routes>
  )
}

export default App