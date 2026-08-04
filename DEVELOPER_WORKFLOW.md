# NoteFlow Developer Workflow

This repository is a two-part app:

- `noteflow-backend/` handles auth, notes, friends, access requests, notifications, and file access rules.
- `noteflow-frontend/` handles the React UI, API calls, routing, and client-side auth state.

## Day-to-day flow

1. Create a branch for one focused change.

```bash
git checkout -b feat/production-hardening
```

2. Make the code change.
3. Run the relevant checks.
4. Commit the change.
5. Push the branch to your fork.
6. Open a pull request.

## Push flow

```bash
git add .
git commit -m "feat: harden auth and add workflow checks"
git push -u origin feat/production-hardening
```

The `-u` flag remembers the upstream branch, so later `git push` and `git pull` work without repeating the branch name.

## Syncing your fork

If `origin` is your fork and you want to pull updates from the original repository, add an `upstream` remote once:

```bash
git remote add upstream <original-repo-url>
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

If you rebase instead of merge, replace the `git merge` line with:

```bash
git rebase upstream/main
```

## Technical flow in this app

- Login and refresh tokens are handled in `noteflow-frontend/src/api/client.js` and `noteflow-backend/apps/accounts/views.py`.
- Private-note access is enforced in `noteflow-backend/apps/access_requests/services.py` and reused by download/preview endpoints.
- Friend and access-request state transitions should only move from `pending` to a final state once.
- CI now runs backend checks/tests and frontend lint/build in `.github/workflows/ci.yml`.

## What to do before pushing

- Fix or review any new errors in the touched files.
- Make sure the branch name matches the change.
- Keep commits small enough that a PR review is easy.