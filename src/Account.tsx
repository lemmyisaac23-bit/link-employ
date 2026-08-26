import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { UserSession } from './auth'
import { getUserProfile, saveUserProfile, type UserProfile } from './store'
import { asset } from './asset'
import './Jobs.css'

function Account() {
  const user = useOutletContext<UserSession>()
  const [profile, setProfile] = useState<UserProfile>(() =>
    getUserProfile(user.id),
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setProfile(getUserProfile(user.id))
  }, [user.id])

  function updateField<K extends keyof UserProfile>(
    key: K,
    value: UserProfile[K],
  ) {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  function handleCvChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    updateField('cvFileName', file ? file.name : '')
  }

  function handleSave(event: FormEvent) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (profile.age && (Number(profile.age) < 16 || Number(profile.age) > 100)) {
      setError('Please enter a valid age between 16 and 100.')
      return
    }

    const saved = saveUserProfile({
      userId: user.id,
      gender: profile.gender,
      age: profile.age.trim(),
      disability: profile.disability,
      disabilityDetails: profile.disabilityDetails.trim(),
      street: profile.street.trim(),
      building: profile.building.trim(),
      town: profile.town.trim(),
      postalAddress: profile.postalAddress.trim(),
      educationLevel: profile.educationLevel,
      experience: profile.experience.trim(),
      cvFileName: profile.cvFileName,
    })

    setProfile(saved)
    setMessage('Your information was saved successfully.')
  }

  return (
    <div className="jobs-view">
      <section className="dash-panel dash-feature-card dash-section-banner">
        <img
          src={asset('images/dash-start.jpg')}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div>
          <h1 className="dash-title">My Information</h1>
          <p className="dash-stat-value">{user.firstName}</p>
          <p className="dash-stat-label">Your profile is active and ready</p>
          <p className="dash-subtitle">
            Add personal and professional details so employers can know you
            better.
          </p>
        </div>
      </section>

      <section className="dash-panel account-grid">
        <div>
          <p className="account-label">Name</p>
          <p className="account-value">
            {user.firstName} {user.lastName}
          </p>
        </div>
        <div>
          <p className="account-label">Email</p>
          <p className="account-value">{user.email}</p>
        </div>
        <div>
          <p className="account-label">Country</p>
          <p className="account-value">{user.country || 'United States'}</p>
        </div>
      </section>

      <form className="account-form" onSubmit={handleSave}>
        <section className="dash-panel">
          <h2 className="jobs-section-title">Personal</h2>
          <div className="account-fields">
            <label className="account-field">
              <span>Gender</span>
              <select
                value={profile.gender}
                onChange={(e) =>
                  updateField('gender', e.target.value as UserProfile['gender'])
                }
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label className="account-field">
              <span>Age</span>
              <input
                type="number"
                min={16}
                max={100}
                placeholder="e.g. 28"
                value={profile.age}
                onChange={(e) => updateField('age', e.target.value)}
              />
            </label>

            <label className="account-field">
              <span>Disability</span>
              <select
                value={profile.disability}
                onChange={(e) =>
                  updateField(
                    'disability',
                    e.target.value as UserProfile['disability'],
                  )
                }
              >
                <option value="">Select option</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            {profile.disability === 'yes' && (
              <label className="account-field account-field-wide">
                <span>Disability details (optional)</span>
                <input
                  type="text"
                  placeholder="Share any support needs for applications"
                  value={profile.disabilityDetails}
                  onChange={(e) =>
                    updateField('disabilityDetails', e.target.value)
                  }
                />
              </label>
            )}
          </div>

          <h3 className="account-subtitle">Address</h3>
          <div className="account-fields">
            <label className="account-field">
              <span>Street</span>
              <input
                type="text"
                placeholder="Street name"
                value={profile.street}
                onChange={(e) => updateField('street', e.target.value)}
              />
            </label>
            <label className="account-field">
              <span>Building</span>
              <input
                type="text"
                placeholder="Building / apartment"
                value={profile.building}
                onChange={(e) => updateField('building', e.target.value)}
              />
            </label>
            <label className="account-field">
              <span>Town</span>
              <input
                type="text"
                placeholder="Town or city"
                value={profile.town}
                onChange={(e) => updateField('town', e.target.value)}
              />
            </label>
            <label className="account-field">
              <span>Postal address</span>
              <input
                type="text"
                placeholder="Postal code / P.O. Box"
                value={profile.postalAddress}
                onChange={(e) => updateField('postalAddress', e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="dash-panel">
          <h2 className="jobs-section-title">Professional</h2>
          <div className="account-fields">
            <label className="account-field account-field-wide">
              <span>Highest educational level</span>
              <select
                value={profile.educationLevel}
                onChange={(e) => updateField('educationLevel', e.target.value)}
              >
                <option value="">Select level</option>
                <option value="High school">High school</option>
                <option value="Diploma / Certificate">
                  Diploma / Certificate
                </option>
                <option value="Bachelor's degree">Bachelor&apos;s degree</option>
                <option value="Master's degree">Master&apos;s degree</option>
                <option value="Doctorate">Doctorate</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="account-field account-field-wide">
              <span>Experience</span>
              <textarea
                rows={4}
                placeholder="Summarize your work experience, skills, and years in the field"
                value={profile.experience}
                onChange={(e) => updateField('experience', e.target.value)}
              />
            </label>

            <label className="account-field account-field-wide">
              <span>Send a CV</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleCvChange}
              />
              {profile.cvFileName && (
                <p className="account-file-note">
                  Selected file: {profile.cvFileName}
                </p>
              )}
            </label>
          </div>
        </section>

        {error && (
          <p className="jobs-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="jobs-message" role="status">
            {message}
          </p>
        )}

        <button type="submit" className="jobs-apply account-save-btn">
          Save information
        </button>
      </form>
    </div>
  )
}

export default Account
