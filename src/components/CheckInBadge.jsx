/**
 * Arrival status for a ticket-holder. The backend exposes only a boolean —
 * the underlying checked_in_at timestamp is not part of the organizer payload,
 * so no check-in time can be shown.
 */
export default function CheckInBadge({ checkedIn }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        checkedIn
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {checkedIn ? 'Checked in' : 'Not checked in'}
    </span>
  )
}
