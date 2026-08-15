import './Jobs.css'
import { asset } from './asset'

function About() {
  return (
    <div className="jobs-view">
      <section className="dash-panel">
        <h1 className="dash-title">About Us</h1>
        <p className="dash-subtitle">
          WorklinksUs is built to make hiring and job search feel connected—not
          scattered.
        </p>
      </section>

      <section className="about-layout">
        <figure className="about-visual dash-panel">
          <img
            src={asset('images/about-bridge.jpg')}
            alt="Professionals collaborating across a modern workplace"
          />
        </figure>

        <article className="dash-panel about-copy">
          <h2>The link that brings work together</h2>
          <p>
            WorklinksUs is the link between employing companies and worldwide
            employers seeking capable people. We gather openings, clarify what
            each role needs, and place candidates where their skills, goals, and
            pace align—so hiring teams spend less time sorting noise and more
            time meeting the right talent.
          </p>
          <p>
            From first profile to final decision, WorklinksUs keeps both sides in
            one clear path: companies post with confidence, job seekers apply to
            roles that fit, and our team helps the connection stick across cities,
            remote teams, and borders. That bridge is our product—simple,
            human, and ready for work that matters.
          </p>
        </article>
      </section>
    </div>
  )
}

export default About
