import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAdminSession, setUserSession, validateAdminLogin } from './auth'
import { findUserByCredentials } from './store'
import './Signup.css'

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (validateAdminLogin(email, password)) {
      setAdminSession(true)
      navigate('/admin')
      return
    }

    const user = findUserByCredentials(email, password)
    if (!user) {
      setError('Invalid email or password.')
      return
    }

    setUserSession({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      country: user.country,
    })
    navigate('/jobs')
  }

  return (
    <div className="signup-page visual-page">
      <header className="signup-top">
        <Link className="signup-brand" to="/">
          <span className="brand-mark" aria-hidden="true" />
          WorklinksUs
        </Link>
        <Link className="signup-back" to="/">
          Back to home
        </Link>
      </header>

      <main className="signup-main">
        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <h1>Sign In</h1>
          <p className="signup-switch">
            New to WorklinksUs? <Link to="/signup">Create an account</Link>
          </p>

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
            <span>Password</span>
            <span className="signup-input-wrap">
              <LockIcon />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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

          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          <button className="signup-submit" type="submit">
            Sign in
          </button>
        </form>
      </main>
    </div>
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

export default SignIn
