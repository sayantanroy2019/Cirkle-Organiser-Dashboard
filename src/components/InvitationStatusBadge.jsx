/**
 * Terminal state of an invitation request. Accepted and rejected are
 * permanent — this badge is the only thing a decided request ever shows,
 * never a control to change it.
 */
export default function InvitationStatusBadge({ status }) {
  const styles = {
    accepted: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset',
    rejected: 'bg-gray-100 text-gray-500',
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset',
  }

  const labels = {
    accepted: 'Accepted',
    rejected: 'Rejected',
    pending: 'Pending',
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] ?? styles.pending
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}
