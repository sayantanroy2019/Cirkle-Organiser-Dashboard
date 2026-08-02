import { Outlet } from 'react-router-dom'
import Topbar from './Topbar'

/** The authenticated frame: topbar + content area. No sidebar. */
export default function Layout() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <Topbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
