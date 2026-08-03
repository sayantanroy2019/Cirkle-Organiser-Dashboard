import { useCallback, useEffect, useState } from 'react'
import { fetchEvents } from '../api/organizer'
import EventCard from '../components/EventCard'
import Spinner from '../components/Spinner'

// Matches the backend's default page size; organizers have few events, so a
// single page is the normal case and "Load more" rarely appears.
const PAGE_SIZE = 50

function EventCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 p-3 sm:gap-4 sm:p-4">
      <div className="size-20 shrink-0 animate-pulse rounded-lg bg-gray-100 sm:size-24" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false)

  const loadFirstPage = useCallback(async ({ signal } = {}) => {
    setStatus('loading')
    try {
      const result = await fetchEvents({ limit: PAGE_SIZE, offset: 0, signal })
      setEvents(result.events)
      setTotal(result.total)
      setStatus('ready')
    } catch (err) {
      if (err.code === 'ERR_CANCELED') return
      // 401 is handled globally by the response interceptor (logout + redirect),
      // so anything reaching here is a real failure worth showing.
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    loadFirstPage({ signal: controller.signal })
    return () => controller.abort()
  }, [loadFirstPage])

  const loadMore = async () => {
    setLoadingMore(true)
    try {
      const result = await fetchEvents({ limit: PAGE_SIZE, offset: events.length })
      setEvents((current) => [...current, ...result.events])
      setTotal(result.total)
    } catch {
      // Keep what's already on screen; the button stays available to retry.
    } finally {
      setLoadingMore(false)
    }
  }

  const hasMore = status === 'ready' && events.length < total

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
        Your Events
      </h1>
      {status === 'ready' && events.length > 0 && (
        <p className="mt-1 text-sm text-gray-500">
          {total} {total === 1 ? 'event' : 'events'}
        </p>
      )}

      {status === 'loading' && (
        <div className="mt-6 space-y-3">
          {[0, 1, 2].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-700">Couldn't load your events.</p>
          <button
            type="button"
            onClick={() => loadFirstPage()}
            className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && events.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm font-medium text-gray-900">
            You don't have any events yet.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Contact Cirkle to get your events listed.
          </p>
        </div>
      )}

      {status === 'ready' && events.length > 0 && (
        <>
          <div className="mt-6 space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                {loadingMore && <Spinner />}
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
