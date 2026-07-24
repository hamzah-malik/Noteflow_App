# NoteFlow frontend

React (Vite) frontend for NoteFlow.

## Windows setup (Command Prompt)

```cmd
cd noteflow-frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. The Vite dev server proxies `/api/*` to `http://localhost:8000` (the Django backend) — see `vite.config.js`. Run the backend first (see the `noteflow-backend` README).

## What's built and verified

`npm run build` passes clean. I ran both servers together and confirmed every route resolves (including client-side routes like `/notes/:id`) and the dev proxy correctly reaches Django before handing this over.

**Public site** (top navbar layout):
- Landing page with a lock→unlock hero animation
- Login page with the AirDrop-style transfer animation (plays once per session, then shows the form)
- Register page

**Authenticated app** (sidebar + top-bar layout, matching the dashboard mockup):
- Dashboard — stats, recent uploads, friend uploads, recently viewed, pending requests with inline approve/reject
- Notes — searchable grid of all notes, each showing locked/pending/unlocked state
- **Note detail page** — full PDF viewer (react-pdf) with zoom, fullscreen, and download for accessible notes; a locked/pending state with a Request Access button otherwise
- Upload — drag-and-drop, restricted to PDF/DOCX/DOC
- Notifications — inline approve/reject, with the big lock→particle-burst→checkmark animation on approval
- Friends — search, send/accept/reject requests, friends list
- Settings — edit name/bio

## Signature components

- **`NoteCard`** — the lock-badge state machine: locked (no access), pending (amber clock), or unlocked (Download). Also plays the big `AccessGrantedAnimation` inline when a note's access flips from pending to granted (detected via polling in `NotesPage`).
- **`AccessGrantedAnimation`** — the standalone lock → particle burst → checkmark sequence, reused identically on the owner's side (right after clicking Approve, in `NotificationItem`) and the requester's side (`NoteCard`), so the metaphor stays consistent on both ends of the interaction.
- **`RequestAccessDialog`** — the "Why do you need access?" modal, wired into both `NotesPage` and `NoteDetailPage`.
- **`ToastProvider`** — global toast system with an auto-dismiss progress bar, used for upload success, access approval, and settings save.
- **`AppShell` / `Sidebar`** — the authenticated app's layout (Dashboard/Notes/Friends/Notifications/Settings), separate from the public `Navbar`.

## Design system

- Signal-blue accent (`#2F5FE0`)
- Single typeface (Plus Jakarta Sans) for headlines and body
- IBM Plex Mono reserved for timestamps/counts only
- Dark mode persists via `localStorage` and defaults to OS preference on first visit; a pre-mount script in `index.html` prevents a flash of the wrong theme on reload
- All colors as CSS variables in `src/index.css` (Tailwind v4 `@theme` block)

## Folder structure

```
src/
├── api/          # axios calls per domain
├── components/
│   └── shared/    # NoteCard, RequestAccessDialog, NotificationItem, AccessGrantedAnimation,
│                  # ToastProvider, TransferAnimation, Sidebar, AppShell, Navbar, PublicLayout
├── features/
│   ├── auth/      # LoginPage, RegisterPage
│   └── notes/     # UploadPage
├── pages/         # LandingPage, DashboardPage, NotesPage, NoteDetailPage,
│                  # NotificationsPage, FriendsPage, SettingsPage
├── hooks/         # useTheme
├── router/        # ProtectedRoute
└── store/         # authStore (Zustand)
```

## Auth flow

Access token lives in memory (Zustand `authStore`), never localStorage. The refresh token is an httpOnly cookie set by the backend. `src/api/client.js` has an axios interceptor that silently refreshes on a 401 and retries the original request.

## Known gaps, stated honestly

- The "just unlocked" animation on the requester's side relies on 15s polling (`NotesPage`), not real-time push — good enough for the brief's "instantly" framing without adding websocket infrastructure, but not literally instant.
- OAuth login buttons (Google/GitHub) shown in some design references are not implemented — the backend has no social-auth support yet.
- Word documents (.docx/.doc) show a "download to view" message rather than an in-browser preview — only PDFs render inline (react-pdf's scope).

## Git

```
git init
git add .
git commit -m "feat: NoteFlow frontend - sidebar shell, PDF viewer, toast system, access-granted animation"
```
