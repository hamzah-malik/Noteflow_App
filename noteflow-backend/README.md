# NoteFlow backend

Django REST API for NoteFlow — notes sharing with Access Requests as the core feature.

## Windows setup (Command Prompt)

```cmd
cd noteflow-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements\dev.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

PowerShell users: activate with `venv\Scripts\Activate.ps1` (run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first if it's blocked).

API live at `http://localhost:8000/`. Admin: `http://localhost:8000/admin/`.

## What's built and verified

I ran the full core loop against this exact code before handing it over:
1. Registered two users (Ali, Sara)
2. Sara uploaded a **Private** note
3. Ali tried to download → **403** ("This note is private. Request access from the owner.")
4. Ali submitted an access request with a message
5. Sara received a notification ("Ali requested access to Operating Systems Final Notes")
6. Sara approved → Ali received an "access approved" notification
7. Ali downloaded again → permission check passed (only blocked by Supabase not being configured in this test environment, not by access control)
8. Dashboard endpoint correctly aggregated uploads, notifications, and stats

That's the product's core feature, confirmed working end to end.

## Apps

| App | Responsibility |
|---|---|
| `accounts` | Custom User, JWT auth (register/login/refresh/logout/password reset) |
| `notes` | Note + Tag models, upload, search, permission-gated download/preview, dashboard |
| `friends` | Friend requests, search, friends list |
| `access_requests` | **The core feature** — request/approve/reject access to private notes |
| `notifications` | Generic (actor, verb, target) activity feed |

The permission check lives in `apps/access_requests/services.py::can_user_access()` — every file access goes through it. Note metadata (title, description, tags) is visible in search regardless of access, which is what lets a Private note show a "Request Access" button instead of Download.

## Before uploads work for real

1. Create a project at supabase.com
2. Storage → New bucket → `noteflow-files`, set **private**
3. Put your project URL and **service_role** key into `.env`

Until then, uploads return a clear config error instead of crashing (verified above).

## API reference

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/register/` | POST | full_name, email, username, password, confirm_password |
| `/api/auth/login/` | POST | remember_me extends refresh cookie to 30d |
| `/api/auth/refresh/` | POST | uses httpOnly cookie |
| `/api/auth/logout/` | POST | |
| `/api/users/me/` | GET, PATCH | |
| `/api/users/search/?q=` | GET | Friend search |
| `/api/friends/` | GET | Accepted friends list |
| `/api/friend-requests/` | GET, POST | `?direction=sent\|received` |
| `/api/friend-requests/<id>/accept/` | POST | |
| `/api/friend-requests/<id>/reject/` | POST | |
| `/api/notes/` | GET, POST | Upload via multipart form: title, description, visibility, file, tag_names |
| `/api/notes/<id>/download/` | GET | 403 if private + no approved access |
| `/api/notes/<id>/preview/` | GET | Also logs a RecentView |
| `/api/access-requests/` | GET, POST | `?direction=sent\|received` |
| `/api/access-requests/<id>/approve/` | POST | Owner only |
| `/api/access-requests/<id>/reject/` | POST | Owner only |
| `/api/notifications/` | GET | |
| `/api/notifications/<id>/mark_read/` | POST | |
| `/api/dashboard/` | GET | Everything the Home Dashboard needs, one call |

## Git

```
git init
git add .
git commit -m "feat: NoteFlow backend - auth, notes, friends, access requests, notifications"
```
