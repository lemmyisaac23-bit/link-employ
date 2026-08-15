import './Jobs.css'
import { asset } from './asset'

const team = [
  {
    name: 'Amara Quinn',
    role: 'Head of Talent Partnerships',
    bio: 'Connects US employers with candidates who are ready to move fast.',
    image: asset('images/team-amara.jpg'),
  },
  {
    name: 'Diego Morales',
    role: 'Director of Employer Success',
    bio: 'Helps hiring teams build pipelines that fit real business needs.',
    image: asset('images/team-diego.jpg'),
  },
  {
    name: 'Priya Shah',
    role: 'Candidate Experience Lead',
    bio: 'Shapes the path from profile to paycheck for job seekers nationwide.',
    image: asset('images/team-priya.jpg'),
  },
]

function Team() {
  return (
    <div className="jobs-view">
      <section className="dash-panel">
        <h1 className="dash-title">Our Team</h1>
        <p className="dash-subtitle">
          The people linking talent with employing companies across the map.
        </p>
      </section>

      <section className="team-grid" aria-label="Team members">
        {team.map((member) => (
          <article key={member.name} className="team-card dash-panel">
            <img src={member.image} alt={member.name} />
            <h2>{member.name}</h2>
            <p className="team-role">{member.role}</p>
            <p className="team-bio">{member.bio}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Team
