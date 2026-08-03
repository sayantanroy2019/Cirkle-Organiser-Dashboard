/**
 * Invite-only carries the accent because it's the type that later needs the
 * organizer to act (accepting or rejecting requests); open is purely neutral.
 */
export default function EventTypeBadge({ eventType }) {
  const inviteOnly = eventType === 'invite_only'

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        inviteOnly
          ? 'bg-brand-light text-brand-dark ring-1 ring-brand/20 ring-inset'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {inviteOnly ? 'Invite-only' : 'Open'}
    </span>
  )
}
