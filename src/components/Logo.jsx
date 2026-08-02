/**
 * Cirkle wordmark. A plain type-set mark with a single accent dot — swap the
 * span for an <img> if a supplied SVG logo lands later.
 */
export default function Logo({ className = '' }) {
  return (
    <span
      className={`inline-flex items-baseline gap-0.5 font-semibold tracking-tight text-gray-900 ${className}`}
    >
      cirkle
      <span className="size-1.5 translate-y-px rounded-full bg-brand" aria-hidden="true" />
    </span>
  )
}
