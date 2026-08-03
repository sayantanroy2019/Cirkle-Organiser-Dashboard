import { useCallback, useEffect, useState } from 'react'
import { useOutletContext, useParams } from 'react-router-dom'
import { fetchAttendees } from '../../api/organizer'
import AttendeeCard from '../../components/AttendeeCard'
import CheckInBadge from '../../components/CheckInBadge'

const PAGE_SIZE = 24

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="aspect-4/5 w-full animate-pulse bg-gray-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

export default function AttendeesTab() {
  const { id } = useParams()
  const { event } = useOutletContext()

  const [attendees, setAttendees] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | notFound | error

  const load = useCallback(
    async (nextOffset, { signal } = {}) => {
      setStatus('loading')
      try {
        const result = await fetchAttendees(id, {
          limit: PAGE_SIZE,
          offset: nextOffset,
          signal,
        })
        setAttendees(result.attendees)
        setTotal(result.total)
        setOffset(result.offset)
        setStatus('ready')
      } catch (err) {
        if (err.code === 'ERR_CANCELED') return
        setStatus(err.response?.status === 404 ? 'notFound' : 'error')
      }
    },
    [id],
  )

  useEffect(() => {
    const controller = new AbortController()
    load(0, { signal: controller.signal })
    return () => controller.abort()
  }, [load])

  if (status === 'notFound') {
    return (
      <div className="rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-700">
        This event's attendees are no longer available.
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="rounded-xl border border-gray-200 p-10 text-center">
        <p className="text-sm text-gray-700">Couldn't load the attendees.</p>
        <button
          type="button"
          onClick={() => load(offset)}
          className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          Try again
        </button>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
        <p className="text-sm font-medium text-gray-900">No attendees yet.</p>
        <p className="mt-1 text-sm text-gray-500">
          {event.eventType === 'invite_only'
            ? 'Once invited guests buy their tickets, they’ll appear here.'
            : 'Everyone who buys a ticket will appear here.'}
        </p>
      </div>
    )
  }

  // Check-in counts describe this page only — the endpoint returns no
  // event-wide checked-in total, so claiming one would be a lie.
  const checkedInOnPage = attendees.filter((a) => a.checkedIn).length
  const from = offset + 1
  const to = offset + attendees.length
  const hasPrev = offset > 0
  const hasNext = to < total

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-sm font-semibold text-gray-900">
          {total} {total === 1 ? 'attendee' : 'attendees'}
        </h2>
        <p className="text-sm text-gray-500">
          {checkedInOnPage} checked in
          {total > attendees.length && ' on this page'}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {attendees.map((attendee) => (
          <AttendeeCard
            key={attendee.ticketId}
            person={attendee}
            badge={<CheckInBadge checkedIn={attendee.checkedIn} />}
          />
        ))}
      </div>

      {(hasPrev || hasNext) && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => load(Math.max(0, offset - PAGE_SIZE))}
              disabled={!hasPrev}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => load(offset + PAGE_SIZE)}
              disabled={!hasNext}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
