import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import type { UserSession } from './auth'
import { type Testimonial } from './store'
import {
  createTestimonial,
  fetchAcceptedTestimonials,
} from './cloudData'
import { asset } from './asset'
import './Jobs.css'

function DashboardHome() {
  const user = useOutletContext<UserSession>()
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [showForm, setShowForm] = useState(false)
  const [quote, setQuote] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void fetchAcceptedTestimonials().then((items) => {
      if (!cancelled) setTestimonials(items.slice(0, 4))
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleShare(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!quote.trim()) {
      setError('Please write your testimonial before sharing.')
      return
    }

    try {
      await createTestimonial({
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: role.trim() || 'WorklinksUs member',
        quote: quote.trim(),
      })
      setQuote('')
      setRole('')
      setShowForm(false)
      setMessage(
        'Thanks! Your testimonial was sent for admin review and will appear once approved.',
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not share testimonial.',
      )
    }
  }

  return (
    <div className="jobs-view">
      <section className="dash-hero-card dash-panel">
        <div className="dash-hero-copy">
          <h1 className="dash-title">Trusted links to real work</h1>
          <p>
            WorklinksUs connects people ready to work with employing companies
            that need proven skills. We keep profiles, openings, and decisions
            in one clear path—so matches feel personal, not random.
          </p>
          <p>
            From your first search to an accepted offer, WorklinksUs supports
            candidates and hiring teams nationwide with open roles, status
            tracking, and a team that treats every application with care.
          </p>
          <Link to="/jobs/about" className="dash-stat-link">
            Learn more about us ›
          </Link>
        </div>
        <figure className="dash-hero-media">
          <img
            src={asset('images/dash-security.jpg')}
            alt="Professionals collaborating in a modern workplace"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </section>

      <section className="dash-panel dash-info-block">
        <h2>How WorklinksUs works for you</h2>
        <div className="dash-info-grid">
          <div>
            <h3>For candidates</h3>
            <p>
              Build a profile once, explore open positions across the United
              States, and apply in a click. Track every application until an
              admin accepts or updates your status.
            </p>
          </div>
          <div>
            <h3>For employers</h3>
            <p>
              WorklinksUs is the bridge to people who already want the work.
              Hiring partners receive clearer matches, faster reviews, and
              candidates whose goals align with the role.
            </p>
          </div>
          <div>
            <h3>Why it matters</h3>
            <p>
              We reduce noise on both sides—so companies hire with confidence
              and job seekers spend time on roles that fit their skills, pace,
              and future.
            </p>
          </div>
        </div>
        <div className="dash-info-actions">
          <Link to="/jobs/team" className="dash-stat-link">
            Meet the team ›
          </Link>
          <Link to="/jobs/help" className="dash-stat-link">
            Open a support ticket ›
          </Link>
        </div>
      </section>

      <section
        className="dash-panel dash-testimonials"
        aria-labelledby="testimonials-heading"
      >
        <div className="dash-testimonials-head">
          <h2 id="testimonials-heading">What people are saying</h2>
          <p>Recent stories from candidates and hiring partners.</p>
        </div>

        <ul className="dash-testimonial-grid">
          {testimonials.map((item) => (
            <li key={item.id} className="dash-testimonial">
              <p className="dash-testimonial-quote">“{item.quote}”</p>
              <div className="dash-testimonial-meta">
                <div>
                  <p className="dash-testimonial-name">{item.name}</p>
                  <p className="dash-testimonial-role">{item.role}</p>
                </div>
                <time className="dash-testimonial-when">{item.when}</time>
              </div>
            </li>
          ))}
        </ul>

        <div className="dash-share-box">
          <button
            type="button"
            className="jobs-apply dash-share-btn"
            onClick={() => {
              setShowForm((open) => !open)
              setError('')
              setMessage('')
            }}
          >
            {showForm ? 'Cancel' : 'Share a testimonial'}
          </button>

          {message && (
            <p className="jobs-message" role="status">
              {message}
            </p>
          )}

          {showForm && (
            <form className="dash-share-form" onSubmit={handleShare}>
              <label>
                <span>Your role or title</span>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer · Remote"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </label>
              <label>
                <span>Your testimonial</span>
                <textarea
                  rows={4}
                  placeholder="Share how WorklinksUs helped you..."
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  required
                />
              </label>
              {error && (
                <p className="signup-error" role="alert">
                  {error}
                </p>
              )}
              <button type="submit" className="jobs-apply">
                Submit for admin review
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}

export default DashboardHome
