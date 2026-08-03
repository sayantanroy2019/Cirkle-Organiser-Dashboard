/**
 * Events are held in Indian cities, so times are always presented in IST
 * regardless of where the organizer's device happens to be.
 */
const IST = 'Asia/Kolkata'

// en-US rather than en-IN purely for the month abbreviation: en-IN renders
// September as "Sept", which is inconsistent beside the other three-letter
// months. Field order is assembled by hand below, so it stays day-first.
const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: IST,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

/** "1 Sep 2026, 7:30 pm" — returns null for missing/unparseable input. */
export function formatEventDateTime(isoString) {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null

  const parts = dateTimeFormatter.formatToParts(date)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? ''

  return `${get('day')} ${get('month')} ${get('year')}, ${get('hour')}:${get('minute')} ${get('dayPeriod').toUpperCase()}`
}

/**
 * Paise → rupees, e.g. 75050 → "₹750.50", 50000 → "₹500".
 * Decimals appear only when there's a paise remainder.
 */
export function formatPaise(paise) {
  const amount = Number.isFinite(paise) ? paise : 0
  const hasPaise = amount % 100 !== 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: hasPaise ? 2 : 0,
  }).format(amount / 100)
}

/**
 * "Priya, 25" — the platform's public way of naming someone. Falls back
 * gracefully when a ticket-holder has no profile row yet (name and age both
 * come back null in that case).
 */
export function formatPersonName(firstName, age) {
  const name = firstName?.trim() || 'Attendee'
  return Number.isFinite(age) ? `${name}, ${age}` : name
}

/** "non_binary" → "Non binary". Returns null for the opt-out value. */
export function formatGender(gender) {
  if (!gender || gender === 'prefer_not_to_say') return null
  const spaced = gender.replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** "137 / 500" when capacity is known, otherwise "137 sold". */
export function formatTicketsSold(ticketsSold, capacity) {
  const sold = Number.isFinite(ticketsSold) ? ticketsSold : 0
  return capacity ? `${sold} / ${capacity} sold` : `${sold} sold`
}
