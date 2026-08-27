import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setAdminSession, validateAdminLogin } from './auth'
import { signInWithCloud } from './cloudAuth'
import { isSupabaseConfigured, supabase } from './supabaseClient'
import './Signup.css'

function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim()
    const normalizedPassword = password.trim()

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }
    if (!normalizedPassword) {
      setError('Please enter your password.')
      return
    }

    setPending(true)
    try {
      if (validateAdminLogin(normalizedEmail, normalizedPassword)) {
        setAdminSession(true)
        // Sign admin into Supabase so RLS can load the full user list
        if (supabase) {
          await supabase.auth.signInWithPassword({
            email: normalizedEmail.toLowerCase(),
            password: normalizedPassword,
          })
        }
        navigate('/admin')
        return
      }

      await signInWithCloud(normalizedEmail, normalizedPassword)
      navigate('/jobs')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Invalid email or password.',
      )
    } finally {
      setPending(false)
    }
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
          {isSupabaseConfigured ? (
            <p className="signup-switch" role="note">
              Use the same email and password on any device. If your account was
              created before cloud login, sign in once on that original device
              first, then try this phone again.
            </p>
          ) : (
            <p className="signup-error" role="status">
              Cloud login is not configured yet. Sign-in only works on the device
              where the account was created.
            </p>
          )}

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

          <button className="signup-submit" type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
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
