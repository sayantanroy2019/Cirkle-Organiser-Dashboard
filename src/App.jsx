import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import EventsPage from './pages/EventsPage'
import EventDetailPage from './pages/EventDetailPage'
import DetailsTab from './pages/event/DetailsTab'
import AttendeesTab from './pages/event/AttendeesTab'
import InvitationsTab from './pages/event/InvitationsTab'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/events" replace />} />
            <Route path="/events" element={<EventsPage />} />
            {/* Tabs are nested routes so each is linkable and the back
                button steps through them. */}
            <Route path="/events/:id" element={<EventDetailPage />}>
              <Route index element={<Navigate to="details" replace />} />
              <Route path="details" element={<DetailsTab />} />
              <Route path="attendees" element={<AttendeesTab />} />
              <Route path="invitations" element={<InvitationsTab />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
