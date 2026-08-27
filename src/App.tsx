import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from './asset'
import { type JobType } from './store'
import { fetchJobTypes } from './cloudData'
import './App.css'

function App() {
  const [showHow, setShowHow] = useState(false)
  const [roles, setRoles] = useState<JobType[]>([])

  useEffect(() => {
    let cancelled = false
    void fetchJobTypes().then((jobs) => {
      if (cancelled) return
      const open = jobs.filter((job) => job.status === 'open')
      setRoles((open.length > 0 ? open : jobs).slice(0, 2))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="page visual-page">
      <header className="nav">
        <a className="brand" href="#top" aria-label="WorklinksUs home">
          <span className="brand-mark" aria-hidden="true" />
          WorklinksUs
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#about">About</a>
          <a href="#team">Team</a>
        </nav>
        <Link className="nav-cta" to="/signup">
          Sign up
        </Link>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-media" aria-hidden="true">
            <img
              src={asset('images/hero-workplace.jpg')}
              alt=""
              className="hero-image"
              fetchPriority="high"
              decoding="async"
            />
            <div className="hero-veil" />
          </div>

          <div className="hero-content">
            <p className="brand-lockup">WorklinksUs</p>
            <h1 id="hero-heading">Your next role, linked across America.</h1>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/signup">
                Start matching
              </Link>
              <button
                type="button"
                className="btn btn-ghost"
                aria-expanded={showHow}
                aria-controls="how-preview"
                onClick={() => setShowHow((open) => !open)}
              >
                See how it works
              </button>
            </div>
            {showHow && (
              <div className="how-preview" id="how-preview" role="region">
                <p>We connect people with jobs that fit.</p>
                <p>
                  Nationwide openings matched to your skills, goals, and pace.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section how" id="how" aria-labelledby="how-heading">
          <div className="section-copy">
            <h2 id="how-heading">Three steps from profile to paycheck.</h2>
            <p>
              WorklinksUs keeps the path clear: tell us what you want, we surface
              US roles that fit, and you apply with confidence.
            </p>
          </div>

          <ol className="steps">
            <li>
              <span className="step-num">01</span>
              <h3>Share your direction</h3>
              <p>Skills, salary range, remote or on-site—your preferences lead.</p>
            </li>
            <li>
              <span className="step-num">02</span>
              <h3>Get matched nationwide</h3>
              <p>We link you with openings from coast to coast that actually fit.</p>
            </li>
            <li>
              <span className="step-num">03</span>
              <h3>Apply and move forward</h3>
              <p>Shortlists, intros, and status tracking—without the noise.</p>
            </li>
          </ol>

          <figure className="feature-visual">
            <img
              src={asset('images/career-connection.jpg')}
              alt="Professionals connecting in a modern US workplace"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </section>

        <section className="section roles" id="roles" aria-labelledby="roles-heading">
          <div className="section-copy">
            <h2 id="roles-heading">Roles hiring across the US</h2>
            <p>A sample of openings our network is actively linking candidates to.</p>
          </div>

          <ul className="role-list">
            {roles.map((role) => (
              <li key={role.id}>
                <Link
                  to="/signup"
                  className={role.status === 'ended' ? 'role-ended' : undefined}
                >
                  <span>{role.title}</span>
                  <span className="role-meta">
                    {role.location} · Deadline {role.deadline}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="section employers"
          id="about"
          aria-labelledby="about-heading"
        >
          <figure className="employers-visual">
            <img
              src={asset('images/about-bridge.jpg')}
              alt="Professionals collaborating across a modern workplace"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div className="section-copy employers-copy">
            <h2 id="about-heading">About WorklinksUs</h2>
            <p>
              WorklinksUs is the link between hiring companies and people seeking
              work that fits. We gather openings, clarify what each role needs,
              and connect candidates where skills, goals, and pace align.
            </p>
            <Link className="btn btn-primary" to="/signup">
              Partner with WorklinksUs
            </Link>
          </div>
        </section>

        <section className="section home-team" id="team" aria-labelledby="team-heading">
          <div className="section-copy">
            <h2 id="team-heading">Our team</h2>
            <p>
              The people linking talent with employing companies across the map.
            </p>
          </div>
          <ul className="home-team-list">
            <li>
              <img
                src={asset('images/team-amara.jpg')}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h3>Amara Quinn</h3>
              <p>Head of Talent Partnerships</p>
            </li>
            <li>
              <img
                src={asset('images/team-diego.jpg')}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h3>Diego Morales</h3>
              <p>Director of Employer Success</p>
            </li>
            <li>
              <img
                src={asset('images/team-priya.jpg')}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <h3>Priya Shah</h3>
              <p>Candidate Experience Lead</p>
            </li>
          </ul>
        </section>

        <section className="section cta-band" aria-labelledby="cta-heading">
          <h2 id="cta-heading">Ready to get linked?</h2>
          <p>Build a profile in minutes and start seeing US matches that fit.</p>
          <Link className="btn btn-primary" to="/signup">
            Create your profile
          </Link>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark" aria-hidden="true" />
          WorklinksUs
        </div>
        <p>Linking people with jobs across the United States.</p>
        <p className="footer-meta">© {new Date().getFullYear()} WorklinksUs</p>
      </footer>
    </div>
  )
}

export default App
