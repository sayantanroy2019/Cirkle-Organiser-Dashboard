import { useOutletContext } from 'react-router-dom'
import ImageWithFallback from '../../components/ImageWithFallback'
import {
  describeCapacity,
  formatEventDateTime,
  formatPaise,
  formatPriceRange,
  formatSoldFraction,
  formatTierQuantity,
} from '../../lib/format'

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
  const ticketCategories = event.ticketCategories ?? []

  return (
    <div className="space-y-8">
      <ImageWithFallback
        src={event.bannerUrl}
        alt={`${event.name} banner`}
        className="h-40 w-full rounded-xl sm:h-56"
      />

      <section>
        <h2 className="sr-only">Sales</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat
            label="Tickets sold"
            value={formatSoldFraction(event.ticketsSold, event.capacitySummary)}
            note={describeCapacity(event.capacitySummary)}
          />
          <Stat
            label="Checked in"
            value={`${event.checkedInCount ?? 0} / ${event.ticketsSold ?? 0}`}
            note="Ticket-holders who have entered the event."
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
          {event.googleFormUrl && (
            <Fact label="Questions form">
              <a
                href={event.googleFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-brand hover:text-brand-dark"
              >
                {event.googleFormUrl}
              </a>
              <span className="mt-0.5 block text-gray-500">
                {event.eventType === 'invite_only'
                  ? "Applicants confirm they've filled this before requesting an invitation — review responses in Google Forms before accepting."
                  : "Buyers confirm they've filled this before purchasing a ticket — responses are in Google Forms."}
              </span>
            </Fact>
          )}
          <Fact label="Ticket price">{formatPriceRange(event.priceRange)}</Fact>
        </dl>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-900">Ticket categories</h2>

        {ticketCategories.length === 0 ? (
          <p className="mt-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
            No ticket categories are configured for this event yet, so no
            tickets can be sold. Contact Cirkle to set them up.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-lg text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th scope="col" className="pb-2 pr-4 font-medium">Category</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Price</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Admits</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Inventory</th>
                  <th scope="col" className="pb-2 font-medium">Sold</th>
                </tr>
              </thead>
              <tbody>
                {ticketCategories.map((tier) => (
                  <tr key={tier.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">
                      {tier.categoryName}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {formatPaise(tier.pricePaise)}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {tier.admitsCount} {tier.admitsCount === 1 ? 'person' : 'people'}
                    </td>
                    <td className="py-2.5 pr-4 text-gray-700">
                      {formatTierQuantity(tier)}
                      {!tier.isUnlimited && tier.ticketQuantity > 0 && (
                        <span className="block text-xs text-gray-500">
                          {tier.peopleCapacity} people
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-gray-700">{tier.ticketsSold ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
