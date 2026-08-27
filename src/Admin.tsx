import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_EMAIL, isAdminAuthenticated, setAdminSession } from './auth'
import {
  type JobApplication,
  type JobType,
  type RegisteredUser,
  type SupportTicket,
  type Testimonial,
} from './store'
import { listRegisteredUsers, signOutCloud } from './cloudAuth'
import {
  createJobType,
  deleteJobType,
  fetchApplications,
  fetchJobTypes,
  fetchSupportTickets,
  fetchTestimonials,
  patchApplicationStatus,
  patchJobType,
  patchJobTypeStatus,
  patchSupportTicketStatus,
  patchTestimonialStatus,
} from './cloudData'
import './Admin.css'

function defaultDeadlineValue() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

function Admin() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [jobs, setJobs] = useState<JobType[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [jobLocation, setJobLocation] = useState(
    'United States · Remote & on-site',
  )
  const [jobEmployer, setJobEmployer] = useState('WorklinksUs Partner')
  const [jobPayPerHour, setJobPayPerHour] = useState('$35')
  const [jobDeadline, setJobDeadline] = useState(defaultDeadlineValue())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [jobError, setJobError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isAdminAuthenticated()) {
        navigate('/signin', { replace: true })
        return
      }

      const [cloudUsers, apps, jobList, testimonialList, ticketList] =
        await Promise.all([
          listRegisteredUsers(),
          fetchApplications(),
          fetchJobTypes(),
          fetchTestimonials(),
          fetchSupportTickets(),
        ])
      if (cancelled) return

      setUsers(cloudUsers)
      setApplications(apps)
      setJobs(jobList)
      setTestimonials(testimonialList)
      setTickets(ticketList)
      setReady(true)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSignOut() {
    setAdminSession(false)
    await signOutCloud()
    navigate('/signin')
  }

  async function handleDecision(id: string, status: 'accepted' | 'denied') {
    setApplications(await patchApplicationStatus(id, status))
  }

  async function handleTestimonialDecision(
    id: string,
    status: 'accepted' | 'denied',
  ) {
    setTestimonials(await patchTestimonialStatus(id, status))
  }

  async function handleTicketDecision(
    id: string,
    status: 'open' | 'resolved' | 'closed',
  ) {
    setTickets(await patchSupportTicketStatus(id, status))
  }

  function resetJobForm() {
    setJobTitle('')
    setJobLocation('United States · Remote & on-site')
    setJobEmployer('WorklinksUs Partner')
    setJobPayPerHour('$35')
    setJobDeadline(defaultDeadlineValue())
    setEditingId(null)
    setJobError('')
  }

  async function handleJobSubmit(event: FormEvent) {
    event.preventDefault()
    if (!jobTitle.trim()) {
      setJobError('Enter a job type title.')
      return
    }
    if (!jobDeadline) {
      setJobError('Set an application deadline.')
      return
    }

    try {
      if (editingId) {
        setJobs(
          await patchJobType(
            editingId,
            jobTitle,
            jobLocation,
            jobDeadline,
            jobEmployer,
            jobPayPerHour,
          ),
        )
      } else {
        setJobs(
          await createJobType(
            jobTitle,
            jobLocation,
            jobDeadline,
            jobEmployer,
            jobPayPerHour,
          ),
        )
      }
      resetJobForm()
    } catch (err) {
      setJobError(
        err instanceof Error
          ? err.message
          : 'Could not save job. Sign in as admin in Supabase and run schema_shared.sql.',
      )
    }
  }

  function startEdit(job: JobType) {
    setEditingId(job.id)
    setJobTitle(job.title)
    setJobLocation(job.location)
    setJobEmployer(job.employer)
    setJobPayPerHour(job.payPerHour)
    setJobDeadline(job.deadline)
    setJobError('')
  }

  async function handleRemoveJob(id: string) {
    setJobs(await deleteJobType(id))
    if (editingId === id) {
      resetJobForm()
    }
  }

  async function handleEndJob(id: string) {
    setJobs(await patchJobTypeStatus(id, 'ended'))
    if (editingId === id) {
      resetJobForm()
    }
  }

  async function handleReopenJob(id: string) {
    setJobs(await patchJobTypeStatus(id, 'open'))
  }

  if (!ready) {
    return null
  }

  const pendingApps = applications.filter((app) => app.status === 'pending')
  const decidedApps = applications.filter((app) => app.status !== 'pending')
  const pendingTestimonials = testimonials.filter(
    (item) => item.status === 'pending',
  )
  const openTickets = tickets.filter((ticket) => ticket.status === 'open')

  return (
    <div className="admin-page visual-page">
      <header className="admin-top">
        <Link className="admin-brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          WorklinksUs Admin
        </Link>
        <div className="admin-top-actions">
          <span className="admin-user">{ADMIN_EMAIL}</span>
          <button type="button" className="admin-signout" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-intro">
          <h1>Dashboard</h1>
          <p>
            Review users from every device, decide on applications, and publish
            job types that appear for all members instantly.
          </p>
        </div>

        <section className="admin-stats" aria-label="Key metrics">
          <article className="admin-stat">
            <p className="admin-stat-value">{users.length}</p>
            <p className="admin-stat-label">Number of users</p>
          </article>
          <article className="admin-stat">
            <p className="admin-stat-value">{pendingApps.length}</p>
            <p className="admin-stat-label">Pending applications</p>
          </article>
          <article className="admin-stat">
            <p className="admin-stat-value">{jobs.length}</p>
            <p className="admin-stat-label">Job types available</p>
          </article>
        </section>

        <section className="admin-panel" aria-labelledby="jobs-heading">
          <h2 id="jobs-heading">Available job types</h2>
          <p className="admin-panel-note">
            Changes save to the cloud and show on every phone and computer.
          </p>

          <form className="admin-job-form" onSubmit={handleJobSubmit}>
            <label className="admin-field">
              <span>Job type</span>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Warehouse Associate"
              />
            </label>
            <label className="admin-field">
              <span>Location details</span>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="United States · Remote & on-site"
              />
            </label>
            <label className="admin-field">
              <span>Employer</span>
              <input
                type="text"
                value={jobEmployer}
                onChange={(e) => setJobEmployer(e.target.value)}
                placeholder="WorklinksUs Partner"
              />
            </label>
            <label className="admin-field">
              <span>Pay per hour</span>
              <input
                type="text"
                value={jobPayPerHour}
                onChange={(e) => setJobPayPerHour(e.target.value)}
                placeholder="$35"
              />
            </label>
            <label className="admin-field">
              <span>Application deadline</span>
              <input
                type="date"
                value={jobDeadline}
                onChange={(e) => setJobDeadline(e.target.value)}
                required
              />
            </label>
            <div className="admin-job-form-actions">
              <button className="admin-btn admin-btn-accept" type="submit">
                {editingId ? 'Update job type' : 'Add job type'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={resetJobForm}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>

          {jobError && (
            <p className="admin-inline-error" role="alert">
              {jobError}
            </p>
          )}

          {jobs.length === 0 ? (
            <p className="admin-empty">No job types yet. Add one above.</p>
          ) : (
            <ul className="admin-apps">
              {jobs.map((job) => (
                <li key={job.id} className="admin-app">
                  <div className="admin-app-copy">
                    <span className="admin-list-name">{job.title}</span>
                    <span className="admin-list-meta">{job.location}</span>
                    <span className="admin-list-meta">
                      {job.employer} · {job.payPerHour}/hr
                    </span>
                    <span className="admin-list-meta">
                      Deadline {job.deadline} ·{' '}
                      <span
                        className={
                          job.status === 'ended'
                            ? 'admin-status-denied'
                            : 'admin-status-accepted'
                        }
                      >
                        {job.status}
                      </span>
                    </span>
                  </div>
                  <div className="admin-app-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary"
                      onClick={() => startEdit(job)}
                    >
                      Edit
                    </button>
                    {job.status === 'open' ? (
                      <button
                        type="button"
                        className="admin-btn admin-btn-end"
                        onClick={() => handleEndJob(job.id)}
                      >
                        Ended
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="admin-btn admin-btn-secondary"
                        onClick={() => handleReopenJob(job.id)}
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      type="button"
                      className="admin-btn admin-btn-deny"
                      onClick={() => handleRemoveJob(job.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="users-heading">
          <h2 id="users-heading">New users</h2>
          {users.length === 0 ? (
            <p className="admin-empty">
              No new users yet. Emails appear here when people create an account.
            </p>
          ) : (
            <ul className="admin-list">
              {users.map((user) => (
                <li key={user.id}>
                  <span className="admin-list-name">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="admin-list-meta">{user.email}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading">Testimonial reviews</h2>
          <p className="admin-panel-note">
            Approve shared stories before they appear on the dashboard.
          </p>
          {pendingTestimonials.length === 0 ? (
            <p className="admin-empty">No testimonials waiting for review.</p>
          ) : (
            <ul className="admin-apps">
              {pendingTestimonials.map((item) => (
                <li key={item.id} className="admin-app">
                  <div className="admin-app-copy">
                    <span className="admin-list-name">{item.name}</span>
                    <span className="admin-list-meta">{item.role}</span>
                    <span className="admin-list-meta">“{item.quote}”</span>
                    <span className="admin-list-meta">
                      Submitted {item.submittedAt}
                    </span>
                  </div>
                  <div className="admin-app-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-accept"
                      onClick={() =>
                        handleTestimonialDecision(item.id, 'accepted')
                      }
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-deny"
                      onClick={() =>
                        handleTestimonialDecision(item.id, 'denied')
                      }
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="tickets-heading">
          <h2 id="tickets-heading">Support tickets</h2>
          <p className="admin-panel-note">
            Review open tickets submitted by users.
          </p>
          {openTickets.length === 0 ? (
            <p className="admin-empty">No open support tickets right now.</p>
          ) : (
            <ul className="admin-apps">
              {openTickets.map((ticket) => (
                <li key={ticket.id} className="admin-app">
                  <div className="admin-app-copy">
                    <span className="admin-list-name">{ticket.subject}</span>
                    <span className="admin-list-meta">
                      {ticket.name} · {ticket.email}
                    </span>
                    <span className="admin-list-meta">{ticket.message}</span>
                    <span className="admin-list-meta">
                      Opened {ticket.createdAt}
                    </span>
                  </div>
                  <div className="admin-app-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-accept"
                      onClick={() => handleTicketDecision(ticket.id, 'resolved')}
                    >
                      Resolve
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-deny"
                      onClick={() => handleTicketDecision(ticket.id, 'closed')}
                    >
                      Close
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="apps-heading">
          <h2 id="apps-heading">Job applications</h2>
          {pendingApps.length === 0 ? (
            <p className="admin-empty">No pending applications right now.</p>
          ) : (
            <ul className="admin-apps">
              {pendingApps.map((app) => (
                <li key={app.id} className="admin-app">
                  <div className="admin-app-copy">
                    <span className="admin-list-name">{app.name}</span>
                    <span className="admin-list-meta">{app.email}</span>
                    <span className="admin-list-meta">
                      Applied for {app.role} · {app.location}
                    </span>
                  </div>
                  <div className="admin-app-actions">
                    <button
                      type="button"
                      className="admin-btn admin-btn-accept"
                      onClick={() => handleDecision(app.id, 'accepted')}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-deny"
                      onClick={() => handleDecision(app.id, 'denied')}
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {decidedApps.length > 0 && (
          <section className="admin-panel" aria-labelledby="decided-heading">
            <h2 id="decided-heading">Recent decisions</h2>
            <ul className="admin-list">
              {decidedApps.map((app) => (
                <li key={app.id}>
                  <span className="admin-list-name">{app.name}</span>
                  <span className="admin-list-meta">
                    {app.email} · {app.role} ·{' '}
                    <span
                      className={
                        app.status === 'accepted'
                          ? 'admin-status-accepted'
                          : 'admin-status-denied'
                      }
                    >
                      {app.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default Admin
