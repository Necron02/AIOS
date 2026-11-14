---
name: nexus-frontend
description: Build or modify NEXUS React and TypeScript pages, reusable components, forms, tables, dialogs, and API integration.
user-invocable: true
---

# NEXUS Frontend Skill

Inspect the existing frontend structure and API contracts before changing UI code. Keep the design coherent with the current application rather than introducing a second design system.

## UX principles
- NEXUS is a desktop-first localhost control panel. Optimize for clear navigation, dense but readable information, and fast resource lookup.
- Prefer useful empty states, loading states, error states, status badges, search, filters, and clear action feedback.
- Every destructive or external side-effect action must have a review/confirmation step that explains exactly what will change.
- Show source/provenance and last-scanned time for discovered information.
- Distinguish configured, discovered, running, healthy, stale, and failed states; do not use one ambiguous status label.
- Do not use decorative counters or mock data in production pages.

## React and TypeScript rules
- Use feature folders and small components. Avoid giant pages and deeply nested conditional rendering.
- Keep API calls in the shared API layer or feature query hooks, not scattered through presentational components.
- Type API request/response data. Do not use `any` to bypass a missing contract.
- Reuse form validation schemas and backend constraints where practical.
- Handle loading, empty, validation, network, and server-error states.
- Keep component state local unless multiple views genuinely share it.
- Ensure keyboard navigation, visible focus, semantic labels, and accessible dialogs.
- Do not place secrets or private environment values in frontend state or logs.

## Completion checks
- Run formatter, lint, typecheck, and frontend tests available in the repo.
- Verify narrow and wide desktop layouts and long file paths.
- Check that actions display pending/success/failure feedback and refresh the affected data.
- Update relevant screenshots/docs only when requested or when UI behavior changed materially.