# Git Versioning Module

Purpose
- Lightweight helper for staging, committing and optionally pushing changes to Git/GitHub.

Behavior
- Finds repository root (searches up from working directory)
- Stages all changes and commits with a sensible default message
- Optionally creates `BOXSAFE_VERSION_NOTES.md` describing the commit
- Attempts to push to `origin` and will try a token from keyring (`gh-token`) or `PASSWORD_GIT` env var if push fails due to auth

How to use
- Programmatic: import `runVersionControl` from `@core/loop/git` and call with options `{ autoPush?: boolean, generateNotes?: boolean, commitMessage?: string }`.
- CLI / manual: this module is intended to be invoked by the agent runtime.

Security
- Token injection only used as a fallback for a single push attempt. Prefer using native credential helpers or keyring (see `core/auth/dasktop/cred`).
