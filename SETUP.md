# Dialed In Dads — Setup Checklist

## Step 1 — Supabase tables
Run the full SQL schema from the planning doc in:
Supabase → SQL Editor → New query → paste → Run

## Step 2 — Add your anon key
Open auth.js and replace:
  YOUR_SUPABASE_ANON_KEY
with the key from:
  Supabase → Settings → API → Project API keys → anon public

## Step 3 — Disable email confirmation (for now)
Supabase → Authentication → Settings → Email confirmations → OFF
(Keeps the invite flow simple during development)

## Step 4 — Seed yourself as a coach
In Supabase → Authentication → Users → Add user (your email + password)
Copy the UUID it creates, then run in SQL Editor:

  insert into coaches (auth_user_id, name, email)
  values ('<your-uuid>', 'Your Name', 'your@email.com');

## Step 5 — Create a test invite
Run in SQL Editor:

  insert into invites (coach_id, email, token, expires_at)
  values (
    '<your-coach-id-from-coaches-table>',
    'testclient@example.com',
    'test-invite-123',
    now() + interval '7 days'
  );

Test URL: http://localhost:PORT/accept-invite.html?token=test-invite-123

## Step 6 — Push to GitHub
Create a new repo called dialed-in-dads
Push all files
Enable GitHub Pages → main branch → root

## Step 7 — Update BASE path if needed
If GitHub Pages URL is bothamf.github.io/dialed-in-dads:
auth.js handles this automatically.
If using a custom domain, no changes needed.
