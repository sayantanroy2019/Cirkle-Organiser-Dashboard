import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api, { isNetworkError } from '../api/client'
import { useAuthStore, useIsAuthenticated } from '../store/authStore'
import Logo from '../components/Logo'
import Spinner from '../components/Spinner'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const GENERIC_CREDENTIAL_ERROR = 'Invalid email or password.'
const GENERIC_FAILURE = 'Something went wrong, please try again.'

export default function LoginPage() {
  const isAuthenticated = useIsAuthenticated()
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to="/events" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError('Enter your email and password.')
      return
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const { data } = await api.post('/organizer/auth/login', {
        email: trimmedEmail,
        password,
      })

      if (!data?.token) {
        // A 200 without a token means the response shape changed — don't
        // half-log-them-in with an undefined token.
        throw new Error('Login response did not include a token')
      }

      login(data.token, data.organizer ?? null)
      navigate('/events', { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        setError(GENERIC_CREDENTIAL_ERROR)
      } else {
        if (isNetworkError(err)) {
          // Most likely cause in this setup: the backend origin allow-list is
          // missing this frontend, or the ngrok tunnel is down.
          console.error('[cirkle] login request never reached the backend', err)
        }
        setError(GENERIC_FAILURE)
      }
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-50 px-4 py-10 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Logo className="text-2xl" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-lg font-semibold tracking-tight text-gray-900">
            Organizer log in
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your events on Cirkle.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:bg-gray-50 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-400 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none disabled:bg-gray-50 sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Spinner />}
              {submitting ? 'Logging in…' : 'Log in'}
            </button>

            <div aria-live="polite" className="min-h-5">
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Accounts are created by Cirkle. Contact your Cirkle admin for access or
          password help.
        </p>
      </div>
    </div>
  )
}
