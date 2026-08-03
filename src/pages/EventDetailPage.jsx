import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useParams } from 'react-router-dom'
import { fetchEvent } from '../api/organizer'
import { fetchReferenceLabels } from '../api/reference'
import EventTypeBadge from '../components/EventTypeBadge'

function BackLink() {
  return (
    <Link
      to="/events"
      className="inline-block text-sm font-medium text-brand hover:text-brand-dark"
    >
      ← Events
    </Link>
  )
}

function DetailSkeleton() {
  return (
    <div>
      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
      <div className="mt-4 h-7 w-2/3 animate-pulse rounded bg-gray-100" />
      <div className="mt-6 h-10 w-full animate-pulse rounded bg-gray-100" />
      <div className="mt-6 h-48 w-full animate-pulse rounded-xl bg-gray-100" />
    </div>
  )
}

const tabClass = ({ isActive }) =>
  `-mb-px shrink-0 border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
    isActive
      ? 'border-brand text-brand'
      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800'
  }`

export default function EventDetailPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [labels, setLabels] = useState({ categories: {}, cities: {} })
  const [status, setStatus] = useState('loading') // loading | ready | notFound | error

  const load = useCallback(
    async ({ signal } = {}) => {
      setStatus('loading')
      try {
        // Resolved together so the details panel never flashes raw ids
        // ("del", "concert") before the labels land. The reference lookup
        // resolves to empty maps on failure, so it can't block the page.
        const [result, referenceLabels] = await Promise.all([
          fetchEvent(id, { signal }),
          fetchReferenceLabels(),
        ])
        setEvent(result)
        setLabels(referenceLabels)
        setStatus(result ? 'ready' : 'notFound')
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        // 404 covers both a bad id and an event belonging to another
        // organizer — the backend deliberately doesn't distinguish.
        setStatus(err.response?.status === 404 ? 'notFound' : 'error')
      }
    },
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    load({ signal: controller.signal })
    return () => controller.abort()
  }, [load])

  if (status === 'loading') return <DetailSkeleton />

  if (status === 'notFound') {
    return (
      <div>
        <BackLink />
        <div className="mt-6 rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-sm font-medium text-gray-900">Event not found.</p>
          <p className="mt-1 text-sm text-gray-500">
            It may have been removed, or it isn't one of your events.
          </p>
          <Link
            to="/events"
            className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-dark"
          >
            Back to your events
          </Link>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div>
        <BackLink />
        <div className="mt-6 rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-700">Couldn't load this event.</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  // Open events have no invitation flow at all, so the tab would only ever
  // show an empty panel — hide it rather than offer a dead end.
  const showInvitations = event.eventType === 'invite_only'

  return (
    <div>
      <BackLink />

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          {event.name}
        </h1>
        <EventTypeBadge eventType={event.eventType} />
      </div>

      <div className="mt-5 border-b border-gray-200">
        <nav className="-mb-px flex gap-6 overflow-x-auto" aria-label="Event sections">
          <NavLink to="details" className={tabClass}>
            Details
          </NavLink>
          <NavLink to="attendees" className={tabClass}>
            Attendees
          </NavLink>
          {showInvitations && (
            <NavLink to="invitations" className={tabClass}>
              Invitations
            </NavLink>
          )}
        </nav>
      </div>

      <div className="mt-6">
        <Outlet context={{ event, labels, reload: load }} />
      </div>
    </div>
  )
}
