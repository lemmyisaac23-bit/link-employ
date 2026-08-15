import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setUserSession } from './auth'
import { addUser } from './store'
import './Signup.css'

function Signup() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const user = addUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        password,
      })

      setUserSession({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
      })
      navigate('/jobs')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not create your account.',
      )
    }
  }

  return (
    <div className="signup-page visual-page">
      <header className="signup-top">
        <Link className="signup-brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          WorklinksUs
        </Link>
        <Link className="signup-back" to="/signin">
          Sign in
        </Link>
      </header>

      <main className="signup-main">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <h1>Create Your Account</h1>
          <p className="signup-switch">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>

          <div className="signup-row">
            <label className="signup-field">
              <span>First Name</span>
              <span className="signup-input-wrap">
                <UserIcon />
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </span>
            </label>

            <label className="signup-field">
              <span>Last Name</span>
              <span className="signup-input-wrap">
                <UserIcon />
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </span>
            </label>
          </div>

          <label className="signup-field">
            <span>Email Address</span>
            <span className="signup-input-wrap">
              <MailIcon />
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </span>
          </label>

          <label className="signup-field">
            <span>Phone Number (Optional)</span>
            <span className="signup-input-wrap">
              <PhoneIcon />
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="+1 234 567 8900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </span>
          </label>

          <label className="signup-field">
            <span>Country (Optional)</span>
            <span className="signup-input-wrap">
              <PinIcon />
              <input
                type="text"
                name="country"
                autoComplete="country-name"
                placeholder="United States"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </span>
          </label>

          <label className="signup-field">
            <span>Password</span>
            <span className="signup-input-wrap">
              <LockIcon />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="signup-eye"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
              >
                <EyeIcon />
              </button>
            </span>
          </label>

          <label className="signup-field">
            <span>Confirm Password</span>
            <span className="signup-input-wrap">
              <LockIcon />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="signup-eye"
                aria-label={
                  showConfirm ? 'Hide confirm password' : 'Show confirm password'
                }
                onClick={() => setShowConfirm((v) => !v)}
              >
                <EyeIcon />
              </button>
            </span>
          </label>

          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          <button className="signup-submit" type="submit">
            Create account
          </button>
        </form>
      </main>
    </div>
  )
}

function UserIcon() {
  return (
    <svg className="signup-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.1 0-7.5 2.1-7.5 4.5V20h15v-1.25c0-2.4-3.4-4.5-7.5-4.5Z"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="signup-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5Z"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="signup-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .57 3.6 1 1 0 0 1-.25 1Z"
      />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg className="signup-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="signup-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-6 0V6a2 2 0 0 1 4 0v2Z"
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="signup-icon signup-eye-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 11.5A4.5 4.5 0 1 1 16.5 12 4.5 4.5 0 0 1 12 16.5Zm0-7A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Z"
      />
    </svg>
  )
}

export default Signup
