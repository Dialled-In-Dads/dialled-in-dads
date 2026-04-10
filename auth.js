// ============================================================
//  DIALED IN DADS — auth.js
//  Supabase init, session management, role-based routing
// ============================================================

const SUPABASE_URL  = 'https://oboeavvjrtuzeovrjsht.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ib2VhdnZqcnR1emVvdnJqc2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MTI2OTksImV4cCI6MjA5MTM4ODY5OX0.VyWtr-gRJRI9L0HxjSeahSwXGUcu8hMPpCGaQllr-Oo'; // ← paste from Supabase → Settings → API

const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);

// ------------------------------------------------------------
//  Base path — handles GitHub Pages subdirectory automatically
// ------------------------------------------------------------
const BASE = (() => {
  const { hostname, pathname } = window.location;
  if (hostname.endsWith('github.io')) {
    const repo = pathname.split('/').filter(Boolean)[0];
    return repo ? '/' + repo : '';
  }
  return '';
})();

// ------------------------------------------------------------
//  Role detection — checks coaches table first, then clients
// ------------------------------------------------------------
async function getRole(userId) {
  const { data: coach } = await db
    .from('coaches')
    .select('id')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (coach) return 'coach';

  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (client) return 'client';

  return null;
}

// ------------------------------------------------------------
//  Navigation helpers
// ------------------------------------------------------------
function goTo(path) {
  window.location.href = BASE + path;
}

async function redirectByRole(userId) {
  const role = await getRole(userId);
  if (role === 'coach')  goTo('/coach/index.html');
  else if (role === 'client') goTo('/client/index.html');
  else showError('Account not set up correctly. Contact your coach.');
}

// ------------------------------------------------------------
//  Page guards — call at top of each protected page
// ------------------------------------------------------------

// Require any logged-in user, return session or redirect to login
async function requireSession() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { goTo('/index.html'); return null; }
  return session;
}

// Require coach role specifically
async function requireCoach() {
  const session = await requireSession();
  if (!session) return null;
  const role = await getRole(session.user.id);
  if (role !== 'coach') { goTo('/index.html'); return null; }
  return session;
}

// Require client role specifically
async function requireClient() {
  const session = await requireSession();
  if (!session) return null;
  const role = await getRole(session.user.id);
  if (role !== 'client') { goTo('/index.html'); return null; }
  return session;
}

// ------------------------------------------------------------
//  Sign out
// ------------------------------------------------------------
async function signOut() {
  await db.auth.signOut();
  goTo('/index.html');
}

// ------------------------------------------------------------
//  Utility — show inline error message on any page
// ------------------------------------------------------------
function showError(msg, elementId = 'error-msg') {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearError(elementId = 'error-msg') {
  const el = document.getElementById(elementId);
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

// ------------------------------------------------------------
//  Get current client record (useful on client pages)
// ------------------------------------------------------------
async function getCurrentClient(userId) {
  const { data } = await db
    .from('clients')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();
  return data;
}

// ------------------------------------------------------------
//  Get current coach record (useful on coach pages)
// ------------------------------------------------------------
async function getCurrentCoach(userId) {
  const { data } = await db
    .from('coaches')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();
  return data;
}
