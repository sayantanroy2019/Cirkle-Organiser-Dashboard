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
