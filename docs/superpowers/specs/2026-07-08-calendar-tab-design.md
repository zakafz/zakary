# Calendar Tab — Design

**Date:** 2026-07-08
**Status:** Approved (design), pending implementation plan

## Summary

Add a new **Calendar** tab to the personal dashboard. It is an Apple-Calendar-style
calendar — month / week / day views — that is smooth, on-brand, and genuinely useful.
The user creates/edits/deletes their own events (CRUD), and the calendar additionally
overlays read-only markers for existing **personal tasks** and **subscription renewals**.

## Goals

- A polished, animated calendar that matches the existing app aesthetic (square corners
  `--radius: 0`, 0.5px subtle borders, OKLCH tokens, serif-italic headings).
- Month / Week / Day views, Apple-like but simpler.
- Full event CRUD backed by Supabase.
- Read-only overlays of personal tasks and subscription renewals.
- Works within the dashboard's narrow `max-w-3xl` column and on mobile.

## Non-Goals (YAGNI)

- Recurring events, reminders/alerts, event location.
- Year view.
- Editing tasks or subscriptions from the calendar (they stay managed in their own tabs).
- Project-task overlays.
- Automated test framework (none exists in the repo).

## Data Model

Only events are new; all overlay data already exists.

New table `public.events`:

```sql
create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  color text not null default 'neutral'
    check (color = any (array['neutral','blue','green','sky','purple','red'])),
  note text,
  created_at timestamptz not null default now()
);
```

- Enable Row Level Security; policy: `using (auth.uid() = user_id)` for select/insert/update/delete
  (matching the pattern implied by the other tables' `user_id default auth.uid()`).
- Applied via a Supabase migration.

### Color palette

Fixed enum, rendered with the existing `Badge` component (`components/ui/badge/badge.tsx`,
which already respects the square radius) using the user-provided custom color classes:

| color   | className                                                              |
|---------|-----------------------------------------------------------------------|
| blue    | `bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300`         |
| green   | `bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300`     |
| sky     | `bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300`            |
| purple  | `bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300` |
| red     | `bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300`            |
| neutral | default Badge styling (fallback)                                        |

A single `EVENT_COLORS` map is the source of truth for these class strings.

## Component Approach — lean custom build (external as reference)

The leading open-source shadcn calendars (Shadcn Event Calendar, charlietlamb/calendar)
are full applications that bake in foreign state/data layers (Zustand, Drizzle ORM, Nuqs)
incompatible with this app's plain `useState` + Supabase-client pattern. Adopting either
wholesale would mean ripping out its entire data/state layer. Instead:

- Build month / week / day views ourselves, self-contained under
  `components/dashboard/calendar/`, using **`date-fns`** (already a dependency) for all
  date math and **`motion`** (already a dependency) for view transitions.
- Use existing shadcn primitives (`Dialog`, `Select`, `Input`, `DatePicker`, `Badge`,
  `ConfirmDelete`, `EmptyState`, `Popover`) so create/edit and detail views feel native.
- Match the app aesthetic directly (square corners `--radius: 0`, 0.5px borders, OKLCH
  tokens, serif headers) — no restyling of foreign markup required.
- Use the external calendars purely as **visual/layout reference** for the week/day
  time-grid.

Rationale: the user wants a genuinely useful, smooth, on-brand calendar. Given no clean
drop-in package exists for this stack, a lean custom build is smaller, fully owned, and
avoids fighting an incompatible state/data layer.

## Views & UX

- **Month (default):** grid of days; event chips per day; "+N more" affordance when a day
  overflows; tapping a day opens Day view.
- **Week / Day:** time-grid columns. Given `max-w-3xl`, week view is tuned for the width
  (compact columns, horizontally scrollable if needed) so it stays smooth on mobile.
- **Controls:** segmented Month / Week / Day switcher; `‹  Today  ›` navigation; animated
  transitions between views via `motion`.
- **Interactions:**
  - Tap an event → detail popover → Edit / Delete (delete uses the existing `ConfirmDelete`).
  - Tap an empty day/slot, or a `+` button → create-event dialog.
  - Create/edit dialog fields: title, start, end, all-day toggle, color, note.

## Overlays (read-only)

Fetched alongside events and merged into the day/slot rendering:

- **Personal tasks** — `tasks.due_date` (date-only) → check-icon chip on that day.
- **Subscription renewals** — `subscriptions.next_billing`, projected forward across the
  visible range by `cycle` (weekly/monthly/yearly) → repeat-icon chip. Reuse (or extract)
  the existing `nextOccurrence` / `ADVANCE` cycle-projection helper from
  `subscriptions-panel.tsx` so projection semantics stay consistent across tabs.
  These projected markers are **display-only** and are never persisted as `events` rows.

Overlay markers use distinct, muted styling so the user's own events stand out. Tapping an
overlay marker opens a small **read-only** detail popover only — no editing from the calendar.

## Wiring

- `components/dashboard/dashboard-tabs.tsx`: add `"calendar"` to the `TabId` union, one
  entry to `TABS` (label "Calendar", a calendar-day Lucide icon, a short description), and
  one branch in `renderPanel()` returning `<CalendarPanel />`.
- `CalendarPanel` performs direct Supabase client CRUD for events (following the existing
  optimistic panel pattern used by e.g. `subscriptions-panel.tsx` / `tasks-panel.tsx`) and
  read fetches for the task/subscription overlays.

## Error Handling

- Supabase read/write failures surface inline (consistent with existing panels); failed
  optimistic writes roll back local state.
- Empty state (no events in range) uses the existing `EmptyState` component.
- Invalid event input (e.g. end before start) is prevented in the dialog before submit.

## Testing / Verification

No test framework exists in the repo, so verification is manual via the preview dev server:

- Create, edit, and delete events; confirm persistence in Supabase.
- Switch Month / Week / Day; confirm smooth transitions and correct data per view.
- Confirm task and subscription overlays render on the correct days (including subscription
  cycle projection).
- Verify mobile / narrow-width layout and dark mode.
```
