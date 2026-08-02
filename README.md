# Cirkle — Organizer Dashboard

A read-only dashboard for event organizers on Cirkle, plus one write action
(accepting/rejecting invitation requests for invite-only events). Mobile-first —
organizers mostly open this on a phone.

This is a standalone frontend against the existing Cirkle backend. It never
modifies the backend or the other frontends (consumer app, admin portal).

## Stack

React 19 + Vite · Tailwind CSS v4 · Zustand · React Router · axios

## Getting started

```bash
npm install
cp .env.example .env.local   # then set VITE_API_URL
npm run dev
```

Dev server runs on a pinned port — **http://localhost:5174**. That port is
already in the backend's CORS allow-list, so local development needs no backend
change. Don't move it without adding the new origin to the backend's allow-list
first. (The consumer app runs on 5173 and proxies `/api`, so it never needs a
CORS entry in dev; 5174 is free for this dashboard.)

`VITE_API_URL` is the base URL of the backend that serves `/organizer/*`. During
development that's the ngrok tunnel to the founder's machine, and it changes
every time the tunnel restarts. It is never hardcoded anywhere in the source.

Every request sends `ngrok-skip-browser-warning: true`, otherwise ngrok returns
its HTML interstitial instead of JSON.

## Structure

```
src/
  api/client.js            axios instance, auth + ngrok headers, 401 handling
  store/authStore.js       Zustand session store (token + organizer), persisted
  components/
    ProtectedRoute.jsx     redirects to /login when there's no session
    Layout.jsx             authenticated frame (topbar + content)
    Topbar.jsx             logo left, organizer name + log out right
  pages/
    LoginPage.jsx          /login
    EventsPage.jsx         /events  (placeholder until Section 2)
```

## Test account

A test organizer exists in the shared Supabase dev database:

```
test@organizer.com / TestOrg123!
```

Created via `POST /admin/organizers` using the seeded founder admin
(`founder@cirkle.live`). To make another, get an admin token from
`POST /admin/auth/login` and post to `/admin/organizers`.

## Auth

- `POST /organizer/auth/login` returns a token; it's attached as
  `Authorization: Bearer <token>` on every subsequent request.
- The token and the organizer profile are persisted to `localStorage` so a
  refresh doesn't log the organizer out. Nothing else is stored in the browser.
- Any 401 (other than the login call itself) clears the session, which flips
  `ProtectedRoute` and lands the organizer back on `/login`.
- There is no signup, forgot-password, or remember-me. Accounts and password
  resets are handled by Cirkle admin.

## Deployment

Vercel, GitHub-connected, as its own project (separate from the consumer app).
Set `VITE_API_URL` as a Vercel environment variable pointing at the current
backend URL.

**Backend change required before going live:** the backend's CORS allow-list
(`createApp()` in the backend repo) currently contains `http://localhost:5173`,
`http://localhost:5174`, and the consumer app's Vercel URL. Local development
works today because this app uses 5174 — but the deployed organizer URL
(e.g. `https://organizer-cirkle.vercel.app`) **must be added** or production
login fails with a CORS error. That's a backend change; it cannot be worked
around from here.

## Scope guardrails

- Organizers cannot create, edit, or delete events. If a form appears here that
  writes event data, it doesn't belong.
- Attendee and invitation profiles from the backend intentionally carry no phone
  number or email. Don't build UI that expects them.
- Photo URLs are short-lived presigned URLs (~1hr). Use them directly in
  `<img src>`; don't cache them — refetch to get fresh ones.
