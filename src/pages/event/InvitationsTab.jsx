import { useCallback, useEffect, useState } from 'react'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { decideInvitation, fetchInvitations } from '../../api/organizer'
import AttendeeCard from '../../components/AttendeeCard'
import InvitationStatusBadge from '../../components/InvitationStatusBadge'
import Spinner from '../../components/Spinner'
import { formatRelativeTime } from '../../lib/format'

const PAGE_SIZE = 24

const FILTERS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
]

const EMPTY_COPY = {
  pending: {
    title: 'No pending invitation requests.',
    body: 'When someone requests an invitation to this event, it will appear here for you to accept or reject.',
  },
  accepted: {
    title: 'No accepted requests yet.',
    body: 'Requests you accept will be listed here.',
  },
  rejected: {
    title: 'No rejected requests.',
    body: 'Requests you reject will be listed here.',
  },
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="aspect-4/5 w-full animate-pulse bg-gray-100" />
      <div className="space-y-2 p-3.5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}

/**
 * The decision controls for one pending request. Owns its own in-flight and
 * error state so a slow or failed decision on one card never blocks another.
 */
function DecisionActions({ invitationId, onDecided, onConflict }) {
  const [submitting, setSubmitting] = useState(null) // null | 'accept' | 'reject'
  const [error, setError] = useState('')

  const decide = async (decision) => {
    if (submitting) return
    setSubmitting(decision)
    setError('')

    try {
      const result = await decideInvitation(invitationId, decision)
      onDecided(result.status)
    } catch (err) {
      if (err.response?.status === 409) {
        // Decided somewhere else since this list was loaded. The response
        // doesn't carry the true status, so the list is refetched rather than
        // guessed at — never leave a stale actionable card.
        onConflict()
        return
      }
      if (err.response?.status === 404) {
        setError('This request is no longer available.')
      } else {
        setError("Couldn't save that. Try again.")
      }
      // Buttons re-enable so the organizer can retry; nothing is shown as decided.
      setSubmitting(null)
    }
  }

  return (
    <div className="mt-auto pt-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => decide('accept')}
          disabled={Boolean(submitting)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === 'accept' && <Spinner className="size-3.5" />}
          Accept
        </button>
        <button
          type="button"
          onClick={() => decide('reject')}
          disabled={Boolean(submitting)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting === 'reject' && <Spinner className="size-3.5" />}
          Reject
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default function InvitationsTab() {
  const { id } = useParams()
  const { event } = useOutletContext()

  const [filter, setFilter] = useState('pending')
  const [invitations, setInvitations] = useState([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | notFound | error
  const [notice, setNotice] = useState('')

  const load = useCallback(
    async (nextFilter, nextOffset, { signal, quiet = false } = {}) => {
      if (!quiet) setStatus('loading')
      try {
        const result = await fetchInvitations(id, {
          status: nextFilter,
          limit: PAGE_SIZE,
          offset: nextOffset,
          signal,
        })
        setInvitations(result.invitations)
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
    setNotice('')
    load(filter, 0, { signal: controller.signal })
    return () => controller.abort()
  }, [load, filter])

  // The tab is hidden for open events, but the URL is still reachable by hand.
  if (event.eventType !== 'invite_only') {
    return <Navigate to="../details" replace />
  }

  /** Mark one card decided in place, and drop it from the pending count. */
  const handleDecided = (invitationId, newStatus) => {
    setInvitations((current) =>
      current.map((invitation) =>
        invitation.invitationId === invitationId
          ? { ...invitation, status: newStatus, justDecided: true }
          : invitation,
      ),
    )
    setTotal((current) => Math.max(0, current - 1))
    setNotice('')
  }

  const handleConflict = () => {
    setNotice('That request had already been decided. The list has been refreshed.')
    load(filter, offset, { quiet: true })
  }

  const from = offset + 1
  const to = offset + invitations.length
  const hasPrev = offset > 0
  const hasNext = to < total

  const filterBar = (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {FILTERS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setFilter(option.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            filter === option.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  if (status === 'notFound') {
    return (
      <div className="rounded-xl border border-gray-200 p-10 text-center text-sm text-gray-700">
        This event's invitations are no longer available.
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {filterBar}
        {status === 'ready' && total > 0 && (
          <p className="text-sm text-gray-500">
            {total} {filter === 'pending' ? 'pending' : filter}
          </p>
        )}
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
          {notice}
        </p>
      )}

      {status === 'error' && (
        <div className="mt-4 rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-sm text-gray-700">Couldn't load invitation requests.</p>
          <button
            type="button"
            onClick={() => load(filter, offset)}
            className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'ready' && invitations.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-sm font-medium text-gray-900">
            {EMPTY_COPY[filter].title}
          </p>
          <p className="mt-1 text-sm text-gray-500">{EMPTY_COPY[filter].body}</p>
        </div>
      )}

      {status === 'ready' && invitations.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {invitations.map((invitation) => {
              const requested = formatRelativeTime(invitation.requestedAt)
              const isPending = invitation.status === 'pending'

              return (
                <AttendeeCard
                  key={invitation.invitationId}
                  person={invitation}
                  badge={
                    isPending ? null : (
                      <InvitationStatusBadge status={invitation.status} />
                    )
                  }
                  actions={
                    <>
                      {requested && (
                        <p className="mt-1 text-xs text-gray-400">
                          Requested {requested}
                        </p>
                      )}
                      {isPending ? (
                        <DecisionActions
                          invitationId={invitation.invitationId}
                          onDecided={(newStatus) =>
                            handleDecided(invitation.invitationId, newStatus)
                          }
                          onConflict={handleConflict}
                        />
                      ) : (
                        invitation.justDecided && (
                          // Decided just now, in this session — say so, but
                          // never offer a way to change it. Terminal is terminal.
                          <p className="mt-2 text-xs text-gray-500">
                            {invitation.status === 'accepted'
                              ? 'Accepted. They can now buy a ticket.'
                              : 'Rejected.'}
                          </p>
                        )
                      )}
                    </>
                  }
                />
              )
            })}
          </div>

          {(hasPrev || hasNext) && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {from}–{to} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => load(filter, Math.max(0, offset - PAGE_SIZE))}
                  disabled={!hasPrev}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => load(filter, offset + PAGE_SIZE)}
                  disabled={!hasNext}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
