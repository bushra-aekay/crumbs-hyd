-- Crumbs.hyd — admin write functions
-- Run this in Supabase SQL Editor (once, after schema.sql + seed.sql).
-- These SECURITY DEFINER functions let the anon key perform writes by
-- bundling the passcode check + the mutation in a single DB call.

-- ── HELPER: check passcode (callable by anon) ────────────────────────────────
CREATE OR REPLACE FUNCTION crumbs_hyd_admin_check(p_passcode text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT p_passcode = admin_passcode FROM crumbs_hyd_config WHERE id = 1;
$$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_admin_check(text) TO anon;

-- ── CATEGORIES ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION crumbs_hyd_upsert_category(
  p_passcode text, p_id text, p_label text, p_sort_order int
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  INSERT INTO crumbs_hyd_categories(id, label, sort_order)
    VALUES(p_id, p_label, p_sort_order)
  ON CONFLICT(id) DO UPDATE SET label = p_label, sort_order = p_sort_order;
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_upsert_category(text, text, text, int) TO anon;

CREATE OR REPLACE FUNCTION crumbs_hyd_delete_category(p_passcode text, p_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  DELETE FROM crumbs_hyd_categories WHERE id = p_id;
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_delete_category(text, text) TO anon;

-- ── ITEMS ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION crumbs_hyd_upsert_item(
  p_passcode text,
  p_id text, p_cat text, p_name text, p_blurb text,
  p_more text, p_tag text, p_variants jsonb, p_toppings jsonb, p_sort_order int
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  INSERT INTO crumbs_hyd_items(id, cat, name, blurb, more, tag, variants, toppings, sort_order)
    VALUES(p_id, p_cat, p_name, p_blurb, p_more, p_tag, p_variants, p_toppings, p_sort_order)
  ON CONFLICT(id) DO UPDATE SET
    cat = p_cat, name = p_name, blurb = p_blurb, more = p_more,
    tag = p_tag, variants = p_variants, toppings = p_toppings,
    sort_order = p_sort_order, updated_at = now();
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_upsert_item(text, text, text, text, text, text, text, jsonb, jsonb, int) TO anon;

CREATE OR REPLACE FUNCTION crumbs_hyd_delete_item(p_passcode text, p_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  DELETE FROM crumbs_hyd_items WHERE id = p_id;
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_delete_item(text, text) TO anon;

-- ── CONFIG ────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION crumbs_hyd_update_config(
  p_passcode text, p_location text, p_tagline text, p_rating numeric, p_reviews int
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  UPDATE crumbs_hyd_config
    SET brand_location = p_location, brand_tagline = p_tagline,
        rating = p_rating, reviews = p_reviews
  WHERE id = 1;
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_update_config(text, text, text, numeric, int) TO anon;

CREATE OR REPLACE FUNCTION crumbs_hyd_change_passcode(p_old_passcode text, p_new_passcode text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT crumbs_hyd_admin_check(p_old_passcode) THEN RAISE EXCEPTION 'wrong passcode'; END IF;
  UPDATE crumbs_hyd_config SET admin_passcode = p_new_passcode WHERE id = 1;
END; $$;
GRANT EXECUTE ON FUNCTION crumbs_hyd_change_passcode(text, text) TO anon;
