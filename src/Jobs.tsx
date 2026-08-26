import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { UserSession } from './auth'
import {
  addApplication,
  getApplicationsForEmail,
  getOpenJobTypes,
  type JobApplication,
  type JobType,
} from './store'
import { asset } from './asset'
import './Jobs.css'

function JobsHome() {
  const user = useOutletContext<UserSession>()
  const [jobs, setJobs] = useState<JobType[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [openAboutId, setOpenAboutId] = useState<string | null>(null)

  useEffect(() => {
    setJobs(getOpenJobTypes())
    setApplications(getApplicationsForEmail(user.email))
  }, [user.email])

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return jobs
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q),
    )
  }, [jobs, query])

  function handleApply(job: JobType) {
    const alreadyApplied = applications.some(
      (app) =>
        app.role.toLowerCase() === job.title.toLowerCase() &&
        (app.status === 'pending' || app.status === 'accepted'),
    )
    if (alreadyApplied) {
      setMessage(`You already applied for ${job.title}.`)
      return
    }

    const updated = addApplication({
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: job.title,
      location: job.location,
    })
    setApplications(
      updated.filter(
        (app) => app.email.toLowerCase() === user.email.toLowerCase(),
      ),
    )
    setMessage(`Application sent for ${job.title}. An admin will review it.`)
  }

  function applicationFor(jobTitle: string) {
    return applications.find(
      (app) => app.role.toLowerCase() === jobTitle.toLowerCase(),
    )
  }

  return (
    <div className="jobs-view">
      <section className="dash-panel dash-feature-card dash-section-banner">
        <img
          src={asset('images/dash-apply.jpg')}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div>
          <h1 className="dash-title">Open Positions</h1>
          <p className="dash-stat-value">{filteredJobs.length}</p>
          <p className="dash-stat-label">Roles ready for applications</p>
          <p className="dash-subtitle">
            Welcome back, {user.firstName}. Browse open roles and apply in one
            click.
          </p>
        </div>
      </section>

      <section className="dash-panel jobs-intro">
        <label className="jobs-search">
          <span className="visually-hidden">Search jobs</span>
          <input
            type="search"
            placeholder="Search by role or location"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </section>

      {message && (
        <p className="jobs-message" role="status">
          {message}
        </p>
      )}

      <section className="dash-panel" aria-labelledby="open-jobs-heading">
        <h2 id="open-jobs-heading" className="jobs-section-title">
          Open positions ({filteredJobs.length})
        </h2>

        {filteredJobs.length === 0 ? (
          <p className="jobs-empty">No open roles match right now.</p>
        ) : (
          <ul className="jobs-list">
            {filteredJobs.map((job) => {
              const existing = applicationFor(job.title)
              return (
                <li key={job.id} className="jobs-item">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.location}</p>
                    <p className="jobs-deadline">Apply by {job.deadline}</p>
                    {existing && (
                      <p className={`jobs-status jobs-status-${existing.status}`}>
                        Status: {existing.status}
                      </p>
                    )}
                    {openAboutId === job.id && (
                      <div className="jobs-about" id={`job-about-${job.id}`}>
                        <h4>Job description</h4>
                        <p>{job.description}</p>
                        <div className="jobs-about-meta" aria-label="Job details">
                          <div>
                            <span>Location</span>
                            <strong>{job.location}</strong>
                          </div>
                          <div>
                            <span>Employer</span>
                            <strong>{job.employer}</strong>
                          </div>
                          <div>
                            <span>Pay per hour</span>
                            <strong>{job.payPerHour}</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="jobs-item-actions">
                    <button
                      type="button"
                      className="jobs-about-btn"
                      aria-expanded={openAboutId === job.id}
                      aria-controls={`job-about-${job.id}`}
                      onClick={() =>
                        setOpenAboutId((current) =>
                          current === job.id ? null : job.id,
                        )
                      }
                    >
                      {openAboutId === job.id ? 'Hide about' : 'About'}
                    </button>
                    <button
                      type="button"
                      className="jobs-apply"
                      disabled={Boolean(
                        existing &&
                          (existing.status === 'pending' ||
                            existing.status === 'accepted'),
                      )}
                      onClick={() => handleApply(job)}
                    >
                      {existing?.status === 'pending'
                        ? 'Applied'
                        : existing?.status === 'accepted'
                          ? 'Accepted'
                          : existing?.status === 'denied'
                            ? 'Apply again'
                            : 'Apply now'}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

export default JobsHome
