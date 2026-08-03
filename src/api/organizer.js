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
