import { FacebookIcon, InstagramIcon, LinkedinIcon } from './SocialIcons'

/**
 * A person's social handles as tappable icons.
 *
 * The backend stores bare handles (no @, no URL) and normalizes on write, so
 * the link is built by simple concatenation — see the backend's
 * src/utils/socialHandles.js. A missing handle renders nothing at all: no
 * greyed-out icon, no placeholder.
 *
 * Handles are self-entered and unverified, so these links prove shape, never
 * identity. Shown for every event type — this is profile data, not something
 * the event gated on.
 */
const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon, url: (h) => `https://instagram.com/${h}` },
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, url: (h) => `https://facebook.com/${h}` },
  { key: 'linkedin', label: 'LinkedIn', Icon: LinkedinIcon, url: (h) => `https://linkedin.com/in/${h}` },
]

export default function SocialLinks({ person, name }) {
  const present = PLATFORMS.filter(({ key }) => {
    const handle = person?.[key]
    return typeof handle === 'string' && handle.trim() !== ''
  })

  if (present.length === 0) return null

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {present.map(({ key, label, Icon, url }) => {
        const handle = person[key].trim()
        return (
          <li key={key}>
            <a
              href={url(encodeURIComponent(handle))}
              target="_blank"
              rel="noopener noreferrer nofollow"
              title={`${label}: ${handle}`}
              aria-label={`${name ? `${name} on ` : ''}${label}`}
              // Generous tap target for a thumb, without bulking up the card.
              className="inline-flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon size={16} />
            </a>
          </li>
        )
      })}
    </ul>
  )
}
