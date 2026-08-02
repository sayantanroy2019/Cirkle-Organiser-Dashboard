import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Logo from './Logo'

export default function Topbar() {
  const organizer = useAuthStore((s) => s.organizer)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link to="/events" className="shrink-0 rounded-sm">
          <Logo className="text-lg sm:text-xl" />
        </Link>

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          {organizer?.displayName && (
            <span className="truncate text-sm text-gray-600" title={organizer.displayName}>
              {organizer.displayName}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
