import { useRef, useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/Icon'
const EMPTY = { name: '', email: '', message: '', consent: false }
export default function ContactForm() {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const busy = useRef(false)
  const confirmation = useRef(null)
  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }
  async function submit(event) {
    event.preventDefault()
    if (busy.current || !form.consent) return
    busy.current = true
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
        }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok)
        throw new Error(
          result?.error ||
            'Your message could not be sent. Please try again shortly.'
        )
      if (!result?.ok)
        throw new Error(
          'The server returned an unexpected response. Please try again.'
        )
      setStatus('success')
      setForm(EMPTY)
      requestAnimationFrame(() => confirmation.current?.focus())
    } catch (err) {
      setStatus('error')
      setError(
        err instanceof TypeError
          ? 'Could not connect. Check your connection and try again; your message is still here.'
          : err.message
      )
    } finally {
      busy.current = false
    }
  }
  if (status === 'success')
    return (
      <div
        ref={confirmation}
        tabIndex={-1}
        className="contact-success"
        role="status"
      >
        <Icon name="check" size={32} />
        <h3>Message received.</h3>
        <p>Thank you for getting in touch.</p>
        <button
          className="button button-outline"
          onClick={() => setStatus('idle')}
        >
          Send another message <Icon />
        </button>
      </div>
    )
  return (
    <form
      onSubmit={submit}
      className="contact-form"
      aria-busy={status === 'sending'}
    >
      <div className="form-row">
        <div>
          <label htmlFor="contact-name">
            Name <span>(required)</span>
          </label>
          <input
            id="contact-name"
            autoComplete="name"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="contact-email">
            Email <span>(required)</span>
          </label>
          <input
            id="contact-email"
            autoComplete="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message">
          Message <span>(required)</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          maxLength={2000}
          placeholder="What are you working on?"
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          aria-describedby="message-limit"
          required
        />
        <span id="message-limit" className="field-hint">
          Up to 2,000 characters.
        </span>
      </div>
      <label className="consent">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => set('consent', e.target.checked)}
          required
        />
        <span>
          I agree to have my name, email, and message stored so you can reply.
          Read the <Link href="/privacy">privacy policy</Link>.
        </span>
      </label>
      <div className="form-submit">
        <button
          type="submit"
          className="button button-primary"
          disabled={!form.consent || status === 'sending'}
        >
          {status === 'sending' ? 'Sending message…' : 'Send message'}
          <Icon />
        </button>
        <span className="field-hint" role="status">
          {status === 'sending'
            ? 'Sending. Please wait.'
            : 'No tracking. Just a conversation.'}
        </span>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
