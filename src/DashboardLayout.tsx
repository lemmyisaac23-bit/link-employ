import { NavLink, Link, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState, type ReactNode } from 'react'
import { type UserSession } from './auth'
import { restoreCloudSession, signOutCloud } from './cloudAuth'
import './Dashboard.css'

type NavItem = {
  to: string
  label: string
  end?: boolean
  icon: ReactNode
}

const navItems: NavItem[] = [
  {
    to: '/jobs',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        />
      </svg>
    ),
  },
  {
    to: '/jobs/positions',
    label: 'Open Positions',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          d="M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1m-10 0h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm0 0h12"
        />
      </svg>
    ),
  },
  {
    to: '/jobs/applications',
    label: 'My Application Status',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          d="M8 7h8M8 11h8M8 15h5M7 3h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 0 1 2-2Z"
        />
      </svg>
    ),
  },
  {
    to: '/jobs/account',
    label: 'My Information',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14Z"
        />
      </svg>
    ),
  },
  {
    to: '/jobs/help',
    label: 'Support Ticket',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          d="M4 12a4 4 0 0 1 4-4h1v8H8a4 4 0 0 1-4-4Zm11-4h1a4 4 0 0 1 0 8h-1V8Zm-7 9v1a3 3 0 0 0 3 3h2"
        />
      </svg>
    ),
  },
]

function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<UserSession | null>(null)
  const [lang, setLang] = useState('English')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSession() {
      const session = await restoreCloudSession()
      if (cancelled) return
      if (!session) {
        navigate('/signup', { replace: true })
        return
      }
      setUser(session)
    }

    void loadSession()
    return () => {
      cancelled = true
    }
  }, [navigate])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sidebarOpen) return

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setSidebarOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  async function handleLogout() {
    await signOutCloud()
    navigate('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className={`dash visual-page${sidebarOpen ? ' sidebar-open' : ''}`}>
      <header className="dash-header">
        <button
          type="button"
          className="dash-menu-btn"
          aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={sidebarOpen}
          aria-controls="dash-sidebar"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          <span className="dash-menu-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <Link className="dash-brand" to="/jobs">
          <span className="dash-logo" aria-hidden="true">
            W
          </span>
          WorklinksUs
        </Link>

        <nav className="dash-top-nav" aria-label="Primary">
          <NavLink to="/jobs" end>
            Home
          </NavLink>
          <NavLink to="/jobs/team">Team</NavLink>
          <NavLink to="/jobs/about">About Us</NavLink>
        </nav>

        <div className="dash-header-actions">
          <label className="dash-lang">
            <span className="visually-hidden">Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Language"
            >
              <option>English</option>
              <option>Español</option>
            </select>
          </label>
          <button type="button" className="dash-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <button
        type="button"
        className="dash-sidebar-backdrop"
        aria-label="Close navigation menu"
        tabIndex={sidebarOpen ? 0 : -1}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="dash-body">
        <aside
          id="dash-sidebar"
          className="dash-sidebar"
          aria-label="Dashboard"
        >
          <div className="dash-sidebar-brand">
            <span className="dash-logo" aria-hidden="true">
              W
            </span>
            <span>WorklinksUs</span>
            <button
              type="button"
              className="dash-sidebar-close"
              aria-label="Close navigation menu"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          </div>

          <nav className="dash-side-nav">
            <p className="dash-side-section">Menu</p>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  isActive ? 'dash-side-link active' : 'dash-side-link'
                }
              >
                <span className="dash-side-main">
                  <span className="dash-side-icon">{item.icon}</span>
                  <span className="dash-side-label">{item.label}</span>
                </span>
                <span className="dash-chevron" aria-hidden="true">
                  ›
                </span>
              </NavLink>
            ))}

            <p className="dash-side-section dash-side-section-more dash-side-mobile-only">
              More
            </p>
            <NavLink
              to="/jobs"
              end
              className={({ isActive }) =>
                `dash-side-link dash-side-mobile-only${isActive ? ' active' : ''}`
              }
            >
              <span className="dash-side-main">
                <span className="dash-side-label">Home</span>
              </span>
              <span className="dash-chevron" aria-hidden="true">
                ›
              </span>
            </NavLink>
            <NavLink
              to="/jobs/team"
              className={({ isActive }) =>
                `dash-side-link dash-side-mobile-only${isActive ? ' active' : ''}`
              }
            >
              <span className="dash-side-main">
                <span className="dash-side-label">Team</span>
              </span>
              <span className="dash-chevron" aria-hidden="true">
                ›
              </span>
            </NavLink>
            <NavLink
              to="/jobs/about"
              className={({ isActive }) =>
                `dash-side-link dash-side-mobile-only${isActive ? ' active' : ''}`
              }
            >
              <span className="dash-side-main">
                <span className="dash-side-label">About Us</span>
              </span>
              <span className="dash-chevron" aria-hidden="true">
                ›
              </span>
            </NavLink>
          </nav>

          <button type="button" className="dash-side-logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                d="M10 7V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-2M15 12H3m0 0 3-3m-3 3 3 3"
              />
            </svg>
            Logout
          </button>
        </aside>

        <div className="dash-content">
          <Outlet context={user} />
        </div>
      </div>

      <Link
        to="/jobs/help"
        className="dash-support-fab"
        aria-label="Open support ticket"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            d="M4 12a4 4 0 0 1 4-4h1v8H8a4 4 0 0 1-4-4Zm11-4h1a4 4 0 0 1 0 8h-1V8Zm-7 9v1a3 3 0 0 0 3 3h2"
          />
        </svg>
        <span>Support</span>
      </Link>
    </div>
  )
}

export default DashboardLayout
