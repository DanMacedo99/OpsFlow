import Sidebar from './components/layout/Sidebar'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-content">
        <DashboardPage />
      </main>
    </div>
  )
}

export default App