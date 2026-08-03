import { Link } from 'react-router-dom'
import ImageWithFallback from './ImageWithFallback'
import EventTypeBadge from './EventTypeBadge'
import { formatEventDateTime, formatTicketsSold } from '../lib/format'

export default function EventCard({ event }) {
  const when = formatEventDateTime(event.startsAt)

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:gap-4 sm:p-4"
    >
      <ImageWithFallback
        src={event.bannerUrl}
        alt=""
        className="size-20 shrink-0 rounded-lg sm:size-24"
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        {/* The name gets the full row — it's what the organizer scans for. */}
        <h2 className="truncate font-semibold text-gray-900 group-hover:text-brand-dark">
          {event.name}
        </h2>

        {when && <p className="truncate text-sm text-gray-600">{when}</p>}
        {event.venueName && (
          <p className="truncate text-sm text-gray-500">{event.venueName}</p>
        )}

        {/* Badge sits beside the count rather than pushed to the card edge, so
            it stays visually attached to the content on wide screens too. */}
        <div className="mt-0.5 flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-700">
            {formatTicketsSold(event.ticketsSold, event.capacity)}
          </p>
          <EventTypeBadge eventType={event.eventType} />
        </div>
      </div>
    </Link>
  )
}
