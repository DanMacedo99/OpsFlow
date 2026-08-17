import { NavLink } from 'react-router-dom'

const navigationItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Suppliers', path: '/suppliers' },
    { label: 'Assessments', path: '/assessments' },
    { label: 'Reports', path: '/reports' },
    { label: 'Settings', path: '/settings' },
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
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    isActive ? 'nav-link active' : 'nav-link'
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    )
}

export default Sidebar