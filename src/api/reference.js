import api from './client'

/**
 * Category and city lookups. Events carry ids ("concert", "del"); these turn
 * them into the labels an organizer should actually read ("Concerts",
 * "Delhi NCR").
 *
 * The reference lists are static and public, so each is fetched once per page
 * load and memoised. A failure is non-fatal — callers fall back to the raw id.
 */
let cache = null

async function loadReference() {
  if (!cache) {
    cache = Promise.all([
      api.get('/reference/event-categories'),
      api.get('/reference/cities'),
    ])
      .then(([categoriesRes, citiesRes]) => ({
        categories: Object.fromEntries(
          (categoriesRes.data?.eventCategories ?? []).map((c) => [c.id, c.label]),
        ),
        cities: Object.fromEntries(
          (citiesRes.data?.cities ?? []).map((c) => [c.id, c.name]),
        ),
      }))
      .catch(() => ({ categories: {}, cities: {} }))
  }
  return cache
}

export function fetchReferenceLabels() {
  return loadReference()
}
