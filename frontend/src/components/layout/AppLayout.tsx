import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'

import '../../App.css'

export default function AppLayout() {
    return (
        <div className="app-shell">
            <a
                className="skip-link"
                href="#main-content"
            >
                Skip to main content
            </a>

            <Sidebar />

            <main
                id="main-content"
                className="main-content"
                tabIndex={-1}
            >
                <Outlet />
            </main>
        </div>
    )
}