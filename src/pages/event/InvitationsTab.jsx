import { Navigate, useOutletContext } from 'react-router-dom'

/** Placeholder — the invitation cards and accept/reject arrive in Section 5. */
export default function InvitationsTab() {
  const { event } = useOutletContext()

  // The tab is hidden for open events, but the URL is still reachable by hand.
  if (event.eventType !== 'invite_only') {
    return <Navigate to="../details" replace />
  }

  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500">
      Invitations — coming in the next section.
    </div>
  )
}
