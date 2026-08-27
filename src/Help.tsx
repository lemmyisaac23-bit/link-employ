import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { UserSession } from './auth'
import { type SupportTicket } from './store'
import {
  createSupportTicket,
  fetchSupportTicketsForEmail,
} from './cloudData'
import './Jobs.css'

function Help() {
  const user = useOutletContext<UserSession>()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    void fetchSupportTicketsForEmail(user.email).then((items) => {
      if (!cancelled) setTickets(items)
    })
    return () => {
      cancelled = true
    }
  }, [user.email])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!subject.trim() || !message.trim()) {
      setError('Please add a subject and message for your ticket.')
      return
    }

    try {
      const updated = await createSupportTicket({
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        subject: subject.trim(),
        message: message.trim(),
      })
      setTickets(updated)
      setSubject('')
      setMessage('')
      setSuccess('Support ticket submitted. An admin will review it soon.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not submit support ticket.',
      )
    }
  }

  return (
    <div className="jobs-view">
      <section className="dash-panel">
        <h1 className="dash-title">Support Ticket</h1>
        <p className="dash-subtitle">
          Open a ticket for profile, application, or account help. Our team
          reviews every request.
        </p>
      </section>

      <section className="dash-panel">
        <h2 className="jobs-section-title">Create a ticket</h2>
        <form className="dash-share-form" onSubmit={handleSubmit}>
          <label>
            <span>Subject</span>
            <input
              type="text"
              placeholder="e.g. Application status question"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Message</span>
            <textarea
              rows={5}
              placeholder="Describe what you need help with..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}
          {success && (
            <p className="jobs-message" role="status">
              {success}
            </p>
          )}
          <button type="submit" className="jobs-apply">
            Submit ticket
          </button>
        </form>
      </section>

      <section className="dash-panel">
        <h2 className="jobs-section-title">Your tickets</h2>
        {tickets.length === 0 ? (
          <p className="jobs-empty">No support tickets yet.</p>
        ) : (
          <ul className="jobs-apps">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <div>
                  <strong>{ticket.subject}</strong>
                  <p>{ticket.message}</p>
                  <p>Opened {ticket.createdAt}</p>
                  {ticket.adminReply && (
                    <div className="jobs-admin-reply">
                      <strong>Admin reply</strong>
                      <p>{ticket.adminReply}</p>
                      {ticket.repliedAt && <p>Replied {ticket.repliedAt}</p>}
                    </div>
                  )}
                </div>
                <span className={`jobs-status jobs-status-${ticket.status === 'open' ? 'pending' : 'accepted'}`}>
                  {ticket.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Help
