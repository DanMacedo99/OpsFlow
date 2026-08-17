const navigationItems = [
    'Overview',
    'Suppliers',
    'Assessments',
    'Documents',
    'Audit log',
]

function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="brand">
                <strong>OpsFlow</strong>
                <span>Supplier Risk</span>
            </div>

            <nav aria-label="Primary navigation">
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
    )
}

export default Sidebar