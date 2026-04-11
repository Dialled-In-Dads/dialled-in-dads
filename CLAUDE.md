# Dialed In Dads — Project Context

This file is read automatically by Claude Code at the start of every session. It contains the full project context so you always know what we're building, why, and how.

---

## The app

A fitness coaching platform for busy dads. Two sides: client (mobile-first) and coach (desktop-first). Built to eventually become a SaaS product with AI coaching baked in.

**Repo:** https://github.com/Dialled-In-Dads/dialled-in-dads
**Live URL:** https://dialled-in-dads.github.io/dialled-in-dads

---

## Tech stack

- Supabase — database + auth
- GitHub Pages — frontend hosting
- Vanilla HTML/CSS/JS — no frameworks
- Anthropic API — AI coaching responses (future feature)
- Supabase URL: https://oboeavvjrtuzeovrjsht.supabase.co

---

## Design system

- Background: #0D1117
- Card surface: #131B2E
- Card border: #1E2A3E
- Win Orange: #C1581A — brand, active nav, buttons, streaks, CTAs
- Green: #2ECC8A — progress, goals hit, graph trending right
- Blue: #5B9BD5 — neutral data, logged but off target
- Muted text: #8892A4
- Subtle text: #4A5568
- Fonts: Anton (headings) + DM Sans (body) via Google Fonts
- No red anywhere. Ever.

### Colour logic
- Weight graph line: green if trending toward goal, grey if going wrong way
- Over calories but logged: blue badge — informational, never judgemental
- Habit ticks: green = hit, blue = logged but missed, grey = not done
- Progress bars: green
- Streak number: Win Orange

---

## Coaching philosophy — baked into every UX decision

- Missing a day is a systems problem, not a discipline problem
- The app never guilts or chases
- When a client returns after a missed day, show: "Yesterday was a miss — no worries. What got in the way? Let's fix the system." — styled in blue, never red
- Missed days show neutrally — no red Xs, no dramatic indicators
- The app is encouraging, not judgmental

---

## The Win Method — workout structure

Every workout has three tiers:

- Tier 1 — Win: key compound lift. Always done. Non-negotiable. Today counts.
- Tier 2 — Bonus: supporting compound lift. Builds on the Win.
- Tier 3 — Extra: isolation work. The finishing touches.

### Completion messages (show on workout page when each tier is logged)
- Win logged → "You won the workout — let's win the day"
- Bonus logged → "Let's gooo!"
- All extras logged → "Money! Didn't just win the workout — got the extras. Let's gooooo!"

---

## Client phases

- Phase 1 — Find the dial (~4 weeks): build tracking habits, no pressure on results
- Phase 2 — Dialling in (ongoing): consistency + progress, 6 days per week
- Phase 3 — Dialled in (maintenance): this is who you are now

---

## File structure

```
index.html              — login page (shared, role-based redirect)
accept-invite.html      — new client onboarding
auth.js                 — Supabase client init, session handling, redirects
CLAUDE.md               — this file
client/
  index.html            — client dashboard
  check-in.html         — morning check-in
  workout.html          — workout logging
  messages.html         — client ↔ coach messages
  progress.html         — deeper stats and charts
coach/
  index.html            — all clients overview
  client.html           — per-client dashboard
  check-in.html         — check-in detail view
  messages.html         — coach messages (all clients)
  programme.html        — programme builder
  goals.html            — goals editor
```

---

## Database schema

All tables are created in Supabase. Here is the full schema for reference:

```sql
create table coaches (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  name text,
  email text,
  coaching_philosophy text,
  created_at timestamp with time zone default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id),
  coach_id uuid references coaches(id),
  name text,
  email text,
  status text default 'active',
  phase text default 'find_the_dial',
  created_at timestamp with time zone default now()
);

create table invites (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id),
  email text,
  token text unique,
  status text default 'pending',
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table client_goals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  calorie_goal int,
  protein_goal_g int,
  fat_min_g int,
  step_goal int,
  target_weight_kg float,
  effective_from date,
  created_at timestamp with time zone default now()
);

create table programmes (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id),
  name text,
  description text,
  total_weeks int,
  created_at timestamp with time zone default now()
);

create table programme_weeks (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid references programmes(id),
  week_number int,
  label text
);

create table programme_days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid references programme_weeks(id),
  day_number int,
  day_type text,
  label text
);

create table workout_blocks (
  id uuid primary key default gen_random_uuid(),
  day_id uuid references programme_days(id),
  tier text,
  block_type text,
  sort_order int
);

create table block_exercises (
  id uuid primary key default gen_random_uuid(),
  block_id uuid references workout_blocks(id),
  exercise_name text,
  muscle_group text,
  sets int,
  rep_scheme text,
  target_weight_kg float,
  sort_order int
);

create table programme_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  programme_id uuid references programmes(id),
  start_date date,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table workout_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  programme_day_id uuid references programme_days(id),
  assignment_id uuid references programme_assignments(id),
  log_date date,
  completed_at timestamp with time zone
);

create table set_logs (
  id uuid primary key default gen_random_uuid(),
  workout_log_id uuid references workout_logs(id),
  block_exercise_id uuid references block_exercises(id),
  set_number int,
  weight_kg float,
  reps_completed int,
  e1rm float
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  goal_id uuid references client_goals(id),
  check_in_date date,
  weight_kg float,
  calories_yesterday int,
  protein_yesterday_g int,
  fat_yesterday_g int,
  steps_yesterday int,
  feeling_score int,
  client_notes text,
  win_completed boolean,
  submitted_at timestamp with time zone default now()
);

create table cardio_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  log_date date,
  cardio_type text,
  duration_min int,
  distance_km float,
  notes text,
  logged_at timestamp with time zone default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid references coaches(id),
  client_id uuid references clients(id),
  sender_role text,
  body text,
  is_read boolean default false,
  sent_at timestamp with time zone default now()
);

create table coach_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  coach_id uuid references coaches(id),
  content text,
  is_pinned boolean default false,
  created_at timestamp with time zone default now()
);
```

---

## Key product decisions

- Persistent login — user stays logged in until they explicitly log out
- Auto-advance programme — moves day by day regardless of missed sessions
- Steps — manual entry only for MVP
- Cardio logging — type, duration, distance, notes (no calorie estimate)
- E1RM calculated client-side using logged sets, stored in set_logs
- client_goals has effective_from date — history preserved when goals change
- Streak = consecutive days with a check-in submitted
- Rest days defined in programme — show rest day message not workout card
- No coach signup screen — one coach (the app owner) for now
- Previous session numbers shown alongside current on workout page
- Programme view is layered: Today → This week → Full plan

---

## Client screens

### 1. Dashboard (client/index.html)
- Page label + date heading in Anton font
- Phase pill (Find the dial / Dialling in / Dialled in) in Win Orange
- Body section: 2x2 grid — weight, 7-day avg, calories yesterday, steps yesterday
- Weight trend chart — green line if trending toward goal, grey if not
- Goal card — start weight → target weight, green progress bar, days remaining
- Today's workout card — Win/Bonus/Extra tier preview, tap to go to workout page
- Rest day card if today is a rest day
- Habits this week — four ticks: cals logged, cal goal hit, workout done, steps hit
- Streak counter in Win Orange
- Coach message card — most recent message, tap to open messages

### 2. Morning check-in (client/check-in.html)
- Missed day banner if no check-in yesterday (blue, not red)
- Fields: weight (kg), calories yesterday, protein (g), fat (g), steps, feeling 1–5, notes
- Show client's current goals alongside relevant inputs
- One check-in per day — show "already checked in" if submitted today
- On submit: write to check_ins table, redirect to dashboard

### 3. Workout (client/workout.html)
- Layered tabs: Today / This week / Full plan
- Exercise cards showing tier badge (Win/Bonus/Extra), sets × reps, target weight
- Previous session numbers shown alongside current inputs
- Per-set logging: weight used + reps completed
- Completion messages when each tier is fully logged
- Add Cardio button: type (run/walk/cycle/row/swim/other), duration, distance, notes
- Rest day view: rest day message, cardio logging available

### 4. Messages (client/messages.html)
- WhatsApp-style thread, coach left / client right
- Check-in submissions appear as cards in thread
- Unread badge on nav

### 5. Progress (client/progress.html)
- Weight chart — full history, 7d/30d/all toggle
- E1RM chart per exercise — dropdown to select exercise
- Habit compliance — weekly bar chart
- Muscle group volume — weekly sets per group, last 8 weeks

---

## Coach screens

### 1. All clients (coach/index.html)
- List of all clients: name, phase, last check-in date, streak, weight trend arrow
- Amber dot (not red) if no check-in in 2+ days
- Today's check-ins filtered view
- Add new client button — opens invite flow

### 2. Client dashboard (coach/client.html)
- Weight, calorie, step trend charts
- Win lift E1RM trend (primary)
- Bonus lift E1RM trend
- Muscle group volume
- Extras completion rate
- Edit goals button
- Change phase button
- Assign programme button
- Pinned coach note (optional)

### 3. Check-in detail (coach/check-in.html)
- All logged values vs goals
- Weight delta vs previous
- Reply button → opens message thread
- Mark as reviewed

### 4. Messages (coach/messages.html)
- Per-client thread
- Client list sidebar on desktop
- Check-in cards inline

### 5. Programme builder (coach/programme.html)
- Programme library
- Build: weeks → days → blocks → exercises
- Tier field is free text (Win/Bonus/Extra for now, flexible for future)
- Block type: straight or superset
- Drag to reorder exercises
- Assign to client with start date

### 6. Goals editor (coach/goals.html)
- Edit calorie, protein, fat, step, target weight goals
- Save creates new client_goals row with effective_from = today
- Previous goals preserved for accurate historical charts

---

## Build order

Build one feature completely before starting the next.

- Feature 1 — Auth + invite flow ✅ COMPLETE
- Feature 2 — Morning check-in page (client/check-in.html)
- Feature 3 — Client dashboard (client/index.html)
- Feature 4 — Programme builder (coach/programme.html)
- Feature 5 — Workout logging (client/workout.html)
- Feature 6 — Messages (client + coach)
- Feature 7 — Coach dashboard + all-clients view

---

## Bottom nav (client)

All client pages share the same bottom nav:
- Dashboard (grid icon)
- Check-in (person icon)
- Workout (barbell icon)
- Messages (headphones icon)

Active page uses Win Orange #C1581A. Inactive uses #4A5568.

---

## Notes for Claude Code

- Always match the design system exactly — no deviating from the colour palette
- Mobile-first for all client pages
- Desktop-first for all coach pages
- Never use red anywhere in the app
- Never show guilt-inducing language for missed days or missed goals
- Keep the coaching philosophy front of mind in every UX decision
- One feature fully working before moving to the next
- Test Supabase reads and writes before marking a feature complete
