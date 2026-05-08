// Initialize Supabase client — exposed as window.crumbsDB
(function () {
  if (!window.supabase || !window.CRUMBS_SUPABASE) return;
  const { createClient } = window.supabase;
  window.crumbsDB = createClient(
    window.CRUMBS_SUPABASE.url,
    window.CRUMBS_SUPABASE.anonKey
  );
})();
