import { Link, useParams } from 'react-router-dom'

/** Placeholder — the Details/Attendees/Invitations tabs arrive in Section 3. */
export default function EventDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <Link
        to="/events"
        className="text-sm font-medium text-brand hover:text-brand-dark"
      >
        ← Back to events
      </Link>

      <h1 className="mt-4 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
        Event detail
      </h1>
      <p className="mt-1 truncate text-sm text-gray-500">{id}</p>

      <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Details · Attendees · Invitations — coming in the next section.
      </div>
    </div>
  )
}
