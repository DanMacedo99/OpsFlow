import './App.css'

const navigationItems = [
  'Overview',
  'Suppliers',
  'Assessments',
  'Documents',
  'Audit log',
]

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <strong>OpsFlow</strong>
          <span>Supplier Risk</span>
        </div>

        <nav aria-label="Main navigation">
          <ul>
            {navigationItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className={item === 'Overview' ? 'nav-link active' : 'nav-link'}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <p className="eyebrow">Supplier Risk Management</p>
            <h1>Dashboard</h1>
          </div>

          <button type="button" className="primary-button">
            Add supplier
          </button>
        </header>

        <section className="content-panel" aria-labelledby="overview-heading">
          <h2 id="overview-heading">Risk overview</h2>
          <p>Supplier metrics will appear here.</p>
        </section>
      </main>
    </div>
  )
}

export default App