import ImageWithFallback from './ImageWithFallback'
import SocialLinks from './SocialLinks'
import { formatGender, formatPersonName } from '../lib/format'

/**
 * Attendee/requester profile card.
 *
 * Renders profile fields and self-entered social handles only. There is
 * deliberately no phone or email in the organizer-facing payload, so none is
 * displayed and none should ever be added here. Cirkle handles all attendee
 * communication.
 */
export default function AttendeeCard({ person, badge, actions }) {
  // Photos come back ordered by position; position 0 is the main one.
  const photos = person.photos ?? []
  const mainPhoto =
    photos.find((p) => p.position === 0) ?? photos[0] ?? null
  const tags = person.lifestyleTags ?? []
  const gender = formatGender(person.gender)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <ImageWithFallback
        src={mainPhoto?.url}
        alt=""
        className="aspect-4/5 w-full"
      />

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        {/* Name gets its own row: in the two-column mobile grid there isn't
            room for a badge beside it without truncating the person's name. */}
        <h3 className="truncate font-semibold text-gray-900">
          {formatPersonName(person.firstName, person.age)}
        </h3>

        {(badge || gender) && (
          <div className="-mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {badge}
            {gender && <span className="text-xs text-gray-500">{gender}</span>}
          </div>
        )}

        {person.tagline && (
          <p className="text-sm text-gray-700">{person.tagline}</p>
        )}

        {person.bio && (
          <p className="line-clamp-3 text-sm text-gray-500">{person.bio}</p>
        )}

        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <li
                key={tag.label}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag.label}
              </li>
            ))}
          </ul>
        )}

        {/* Pushed to the bottom so cards of differing content still line up. */}
        <div className="mt-auto">
          <SocialLinks person={person} name={person.firstName} />
        </div>

        {actions}
      </div>
    </article>
  )
}
