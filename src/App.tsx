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
        <DashboardPage />
      </main>
    </div>
  )
}

export default App