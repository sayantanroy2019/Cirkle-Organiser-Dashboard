// Brand glyphs, inlined — no network images, and lucide dropped brand icons in
// v1. Drawn to lucide's conventions (24px viewBox, currentColor, round caps) so
// they sit together evenly. The Instagram glyph is kept identical to the
// consumer app's InstagramIcon so the two products draw the same mark.

const base = (size, strokeWidth, className) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className,
  'aria-hidden': 'true',
})

export function InstagramIcon({ size = 16, strokeWidth = 2, className = '' }) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function FacebookIcon({ size = 16, strokeWidth = 2, className = '' }) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function LinkedinIcon({ size = 16, strokeWidth = 2, className = '' }) {
  return (
    <svg {...base(size, strokeWidth, className)}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}
