import api from './client'

/**
 * GET /organizer/events — the logged-in organizer's own events.
 *
 * Scoping comes from the token; there is no organizer id to pass. The server
 * returns the shared pagination envelope { data, total, limit, offset } and
 * orders by starts_at DESC — we render in whatever order it gives us.
 */
export async function fetchEvents({ limit = 50, offset = 0, signal } = {}) {
  const { data } = await api.get('/organizer/events', {
    params: { limit, offset },
    signal,
  })

  return {
    events: data?.data ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
  }
}

/**
 * GET /organizer/events/:id — full detail, enveloped as { event }.
 *
 * The backend returns 404 both for a nonexistent event and for one belonging
 * to another organizer, so existence is never confirmed to the wrong person.
 * Callers treat 404 as a plain "not found".
 */
export async function fetchEvent(id, { signal } = {}) {
  const { data } = await api.get(`/organizer/events/${id}`, { signal })
  return data?.event ?? null
}

/**
 * GET /organizer/events/:id/attendees — the guest list, as profile cards.
 *
 * The response carries NO phone or email: the backend's query never selects
 * those columns, so there is nothing to render even by accident. Ordered by
 * ticket creation, newest first.
 */
export async function fetchAttendees(eventId, { limit = 24, offset = 0, signal } = {}) {
  const { data } = await api.get(`/organizer/events/${eventId}/attendees`, {
    params: { limit, offset },
    signal,
  })

  return {
    attendees: data?.data ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
  }
}

/**
 * GET /organizer/events/:id/invitations — requests to attend an invite-only
 * event, as profile cards. Same no-phone/no-email guarantee as attendees.
 * Defaults to `pending`, the set that still needs a decision.
 */
export async function fetchInvitations(
  eventId,
  { status = 'pending', limit = 24, offset = 0, signal } = {},
) {
  const { data } = await api.get(`/organizer/events/${eventId}/invitations`, {
    params: { status, limit, offset },
    signal,
  })

  return {
    invitations: data?.data ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit,
    offset: data?.offset ?? offset,
  }
}

/**
 * POST /organizer/invitations/:id/decision — the only write action in the
 * dashboard. Accepting lets the requester buy a ticket; the backend's payment
 * gate reads this.
 *
 * Decisions are terminal: deciding an already-decided invitation returns 409,
 * and there is no way to undo one. 404 means it isn't this organizer's.
 */
export async function decideInvitation(invitationId, decision) {
  const { data } = await api.post(`/organizer/invitations/${invitationId}/decision`, {
    decision,
  })
  return data // { invitationId, status }
}
