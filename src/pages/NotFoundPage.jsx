import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-brand">404</p>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-gray-900">
        Page not found
      </h1>
      <Link
        to="/events"
        className="mt-4 inline-block text-sm font-medium text-brand hover:text-brand-dark"
      >
        Back to events
      </Link>
    </div>
  )
}
