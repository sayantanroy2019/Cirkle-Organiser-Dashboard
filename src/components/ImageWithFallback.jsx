import { useEffect, useState } from 'react'

function Placeholder({ className }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <svg
        className="size-6 text-gray-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-4.5-4.5L7 21" />
      </svg>
    </div>
  )
}

/**
 * Image that degrades to a neutral placeholder instead of a broken-image icon.
 *
 * Event photos arrive as presigned S3 URLs with a ~1hr TTL, so a URL that
 * worked on load can fail later. Refetching the event data yields a fresh URL;
 * the `src` key resets the error state so that recovery actually shows.
 */
export default function ImageWithFallback({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return <Placeholder className={className} />
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
