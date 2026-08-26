import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { UserSession } from './auth'
import { getApplicationsForEmail, type JobApplication } from './store'
import { asset } from './asset'
import './Jobs.css'

function Applications() {
  const user = useOutletContext<UserSession>()
  const [applications, setApplications] = useState<JobApplication[]>([])

  useEffect(() => {
    setApplications(getApplicationsForEmail(user.email))
  }, [user.email])

  const pending = applications.filter((app) => app.status === 'pending').length
  const accepted = applications.filter((app) => app.status === 'accepted').length

  return (
    <div className="jobs-view">
      <section className="dash-panel dash-feature-card dash-section-banner">
        <img
          src={asset('images/dash-match.jpg')}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div>
          <h1 className="dash-title">My Application Status</h1>
          <p className="dash-stat-value">{pending}</p>
          <p className="dash-stat-label">
            Pending reviews · {accepted} accepted
          </p>
          <p className="dash-subtitle">
            Track every role you have applied for and its current status.
          </p>
        </div>
      </section>

      <section className="dash-panel">
        {applications.length === 0 ? (
          <p className="jobs-empty">
            No applications yet.{' '}
            <Link to="/jobs/positions" className="dash-stat-link">
              Browse open positions
            </Link>{' '}
            to apply.
          </p>
        ) : (
          <ul className="jobs-apps">
            {applications.map((app) => (
              <li key={app.id}>
                <div>
                  <strong>{app.role}</strong>
                  <p>{app.location}</p>
                </div>
                <span className={`jobs-status jobs-status-${app.status}`}>
                  {app.appliedAt} · {app.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Applications
