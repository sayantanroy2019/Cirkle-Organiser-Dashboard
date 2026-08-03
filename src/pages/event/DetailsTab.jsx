import { useOutletContext } from 'react-router-dom'
import ImageWithFallback from '../../components/ImageWithFallback'
import { formatEventDateTime, formatPaise } from '../../lib/format'

function Stat({ label, value, note }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-gray-900">
        {value}
      </p>
      {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
    </div>
  )
}

function Fact({ label, children }) {
  if (children === null || children === undefined || children === '') return null
  return (
    <div className="border-b border-gray-100 py-3 last:border-b-0 sm:flex sm:gap-6 sm:py-3.5">
      <dt className="text-sm text-gray-500 sm:w-40 sm:shrink-0">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900 sm:mt-0">{children}</dd>
    </div>
  )
}

export default function DetailsTab() {
  const { event, labels } = useOutletContext()

  // Fall back to the raw id if the reference lists didn't load.
  const category = labels.categories[event.categoryId] ?? event.categoryId
  const city = labels.cities[event.cityId] ?? event.cityId
  const gallery = event.gallery ?? []

  return (
    <div className="space-y-8">
      <ImageWithFallback
        src={event.bannerUrl}
        alt={`${event.name} banner`}
        className="h-40 w-full rounded-xl sm:h-56"
      />

      <section>
        <h2 className="sr-only">Sales</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stat
            label="Tickets sold"
            value={
              event.capacity
                ? `${event.ticketsSold ?? 0} / ${event.capacity}`
                : `${event.ticketsSold ?? 0}`
            }
            note={event.capacity ? `Capacity ${event.capacity}` : 'No capacity limit'}
          />
          <Stat
            label="Gross sales"
            value={formatPaise(event.grossSalesPaise)}
            note="Gross collected, before fees and refunds — not a payout figure."
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900">Event information</h2>
        <dl className="mt-2">
          <Fact label="Date & time">{formatEventDateTime(event.startsAt)}</Fact>
          <Fact label="Ends">{formatEventDateTime(event.endsAt)}</Fact>
          <Fact label="Venue">
            {event.venueName}
            {event.venueAddress && (
              <span className="mt-0.5 block text-gray-500">{event.venueAddress}</span>
            )}
          </Fact>
          <Fact label="City">{city}</Fact>
          <Fact label="Category">{category}</Fact>
          <Fact label="Ticket price">{formatPaise(event.price)}</Fact>
        </dl>
      </section>

      {event.description && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Description</h2>
          <p className="mt-2 text-sm whitespace-pre-line text-gray-700">
            {event.description}
          </p>
        </section>
      )}

      {gallery.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-900">Gallery</h2>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {gallery.map((photo) => (
              <ImageWithFallback
                key={photo.id ?? photo.position}
                src={photo.url}
                alt=""
                className="aspect-square w-full rounded-lg"
              />
            ))}
          </div>
        </section>
      )}

      <p className="border-t border-gray-100 pt-6 text-xs text-gray-500">
        Need to change event details? Contact Cirkle.
      </p>
    </div>
  )
}
