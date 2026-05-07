// Crumbs — Supabase config
// NOTE: the URL was given as the dashboard URL; the API URL is derived from the project ref.
window.CRUMBS_SUPABASE = {
  url: 'https://xaaiqnqbknuazzavuofx.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWlxbnFia251YXp6YXZ1b2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMDA1MDMsImV4cCI6MjA5MzY3NjUwM30.cj5LjNcVyr37EYUnPYFgMldOOJ7qnGwfOoNVwbfv6Ys',
  // Tables are prefixed crumbs_hyd_* to avoid collisions with other projects in this DB.
  tables: {
    categories: 'crumbs_hyd_categories',
    items:      'crumbs_hyd_items',
    config:     'crumbs_hyd_config',     // single-row: { admin_passcode, ... }
  },
  passcode: 'mehdipatnam-crumbs-2025', // generated; you can change this in Supabase later
};
