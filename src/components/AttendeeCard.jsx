import { useState } from 'react'
import ImageWithFallback from './ImageWithFallback'
import SocialLinks from './SocialLinks'
import { formatGender, formatPersonName } from '../lib/format'

// Inline chevrons — the dashboard has no icon library (see ImageWithFallback).
function Chevron({ dir }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <polyline points={dir === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
    </svg>
  )
}

/**
 * The photo hero. A profile can have up to 4 photos; the organizer reviews
 * a request by looking at all of them, so this is a small gallery — tap the
 * image (or the arrows) to move through, with dots showing position. One
 * photo renders exactly as before, no controls.
 */
function PhotoGallery({ photos }) {
  const [index, setIndex] = useState(0)
  const count = photos.length
  const go = (delta) => (e) => {
    e.stopPropagation()
    setIndex((i) => (i + delta + count) % count)
  }

  if (count <= 1) {
    return <ImageWithFallback src={photos[0]?.url} alt="" className="aspect-4/5 w-full" />
  }

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={go(1)}
        className="block w-full cursor-pointer"
        aria-label="Next photo"
      >
        <ImageWithFallback src={photos[index]?.url} alt="" className="aspect-4/5 w-full" />
      </button>

      {/* Position dots */}
      <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center gap-1.5 px-3">
        {photos.map((p, i) => (
          <span
            key={p.position ?? i}
            className={`h-1 flex-1 max-w-8 rounded-full transition-colors ${
              i === index ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>

      {/* Prev / next — always visible on touch, emphasised on hover for desktop */}
      <button
        type="button"
        onClick={go(-1)}
        aria-label="Previous photo"
        className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-70 transition-opacity hover:bg-black/60 group-hover:opacity-100"
      >
        <Chevron dir="left" />
      </button>
      <button
        type="button"
        onClick={go(1)}
        aria-label="Next photo"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white opacity-70 transition-opacity hover:bg-black/60 group-hover:opacity-100"
      >
        <Chevron dir="right" />
      </button>

      <span className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
        {index + 1}/{count}
      </span>
    </div>
  )
}

/**
 * Attendee/requester profile card.
 *
 * Renders profile fields and self-entered social handles only. There is
 * deliberately no phone or email in the organizer-facing payload, so none is
 * displayed and none should ever be added here. Cirkle handles all attendee
 * communication.
 */
export default function AttendeeCard({ person, badge, actions }) {
  // Photos come back ordered by position (position 0 is the main one), so the
  // gallery opens on the main photo and the organizer can page through the rest.
  const photos = person.photos ?? []
  const tags = person.lifestyleTags ?? []
  const gender = formatGender(person.gender)

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      <PhotoGallery photos={photos} />

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
