-- Crumbs.hyd — new items seed
-- Run in Supabase SQL Editor. Safe to re-run (uses ON CONFLICT upsert).
-- NOTE: If you already created a "Cookie Tins" category in admin,
--       you can delete it from admin after running this — these inserts
--       use the ID 'cookie-tins' which this SQL creates cleanly.

-- ── CATEGORIES ─────────────────────────────────────────────────────────────
INSERT INTO crumbs_hyd_categories (id, label, sort_order) VALUES
  ('cookie-tins',   'Cookie Tins',             10),
  ('matilda-cakes', 'Matilda Cake Tins',        11),
  ('mothers-day',   'Mother''s Day Special',   12)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

-- ── COOKIE TINS ─────────────────────────────────────────────────────────────

-- 5.5 inch cookie tin
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'tin-55', 'cookie-tins',
  '5.5 inch cookie tin',
  'real chocolate in a tin worth keeping. five flavours, one size. 480–500g.',
  'classic — real high-quality chocolate, done properly. biscoff — original imported lotus biscoff. hazelnut — smooth and rich. kinder bueno inspired — our own take, made entirely from scratch, flavours inspired and replicated by us. no actual kinder bueno used. 550–580g. pistachio kunafa — kataifi, pistachio spread, dark and milk chocolate. dubai chocolate in a tin.',
  NULL,
  '[
    {"label":"classic","price":699,"desc":"real high-quality chocolate. 480–500g."},
    {"label":"biscoff","price":789,"desc":"original imported lotus biscoff. 480–500g."},
    {"label":"hazelnut","price":629,"desc":"480–500g."},
    {"label":"kinder bueno inspired","price":699,"desc":"our own take — made from scratch, not using actual kinder bueno. flavours inspired and replicated by us. 550–580g."},
    {"label":"pistachio kunafa","price":789,"desc":"kataifi, pistachio spread, dark and milk chocolate. dubai chocolate in a tin. 480–500g."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- 3 inch cookie tin
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'tin-3', 'cookie-tins',
  '3 inch cookie tin',
  'same magic, smaller tin. 160–180g.',
  'all three flavours are the same quality as the 5.5 inch — just a smaller portion. classic, biscoff, or hazelnut.',
  NULL,
  '[
    {"label":"classic","price":229,"desc":"real high-quality chocolate. 160–180g."},
    {"label":"hazelnut","price":229,"desc":"160–180g."},
    {"label":"biscoff","price":239,"desc":"original imported lotus biscoff. 160–180g."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  2
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- ── MATILDA CAKE TINS ───────────────────────────────────────────────────────

-- shared dip toppings for all matilda cakes
-- white ₹55 · milk ₹40 · dark ₹30

-- Matilda classic
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'matilda-classic', 'matilda-cakes',
  'Matilda classic',
  'dark chocolate cake, milk chocolate ganache, chips, a whisper of coffee. 450–500g.',
  'dark chocolate sponge layered with milk chocolate ganache and milk chocolate chips, with a barely-there coffee note — not a coffee cake, just a little depth. add a pourable dip on the side if you want: white, milk, or dark. 40–50g dip.',
  NULL,
  '[{"label":"classic","price":689}]'::jsonb,
  '[
    {"id":"dip-white","label":"white chocolate dip (40–50g)","price":55},
    {"id":"dip-milk","label":"milk chocolate dip (40–50g)","price":40},
    {"id":"dip-dark","label":"dark chocolate dip (40–50g)","price":30}
  ]'::jsonb,
  '[]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- Matilda crunch
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'matilda-crunch', 'matilda-cakes',
  'Matilda crunch',
  'classic matilda plus a feuilletine and milk chocolate crunch layer. 540–560g.',
  'everything in the classic, plus a feuilletine crunch layer — thin, crispy, and folded into milk chocolate. adds texture without overwhelming. add a pourable dip on the side if you want. 40–50g dip.',
  NULL,
  '[{"label":"crunch","price":789}]'::jsonb,
  '[
    {"id":"dip-white","label":"white chocolate dip (40–50g)","price":55},
    {"id":"dip-milk","label":"milk chocolate dip (40–50g)","price":40},
    {"id":"dip-dark","label":"dark chocolate dip (40–50g)","price":30}
  ]'::jsonb,
  '[]'::jsonb,
  2
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- Matilda pistachio kunafa
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'matilda-pistachio', 'matilda-cakes',
  'Matilda pistachio kunafa',
  'cake, ganache, choco chips, pistachio kataifi, ganache. in that order. 605g.',
  'the full stack: dark chocolate cake, milk chocolate ganache, chocolate chips, a layer of pistachio kataifi, then ganache again on top. crunchy then soft. add a pourable dip on the side. 40–50g dip.',
  'bestseller',
  '[{"label":"pistachio kunafa","price":839}]'::jsonb,
  '[
    {"id":"dip-white","label":"white chocolate dip (40–50g)","price":55},
    {"id":"dip-milk","label":"milk chocolate dip (40–50g)","price":40},
    {"id":"dip-dark","label":"dark chocolate dip (40–50g)","price":30}
  ]'::jsonb,
  '[]'::jsonb,
  3
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- ── MOTHER'S DAY SPECIAL ────────────────────────────────────────────────────
-- All items: tres leches-inspired base, moist, choice of 2 buttercream colors
-- Colors available: blue, purple, red, grey, pink, yellow, green
-- Tag: may special — visible to customers, can mark coming-soon after May

-- Cake in a cup
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'md-cup', 'mothers-day',
  'Two cakes in a cup',
  'two little cakes, two buttercream colors, all in one cup. tres leches-inspired, very moist. 450–550g.',
  'tres leches-inspired base — not a full soak, but moist and flavourful in that direction. topped with two contrasting buttercream colors of your choice (pick any two from: blue, purple, red, grey, pink, yellow, green). tell us your colors in the DM. available through may only.',
  'may special',
  '[
    {"label":"caramel sea salt & almonds","price":329,"desc":"caramel, sea salt, almonds. balanced and a little salty."},
    {"label":"biscoff","price":369,"desc":"contains biscoff spread and crushed biscoff."},
    {"label":"hazelnut","price":359,"desc":"contains hazelnut spread and crushed hazelnuts."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  1
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- Cake in a mug
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'md-mug', 'mothers-day',
  'Cake in a mug',
  'a real cake in a real mug, designed to order. tiny and very pinterest. 150–200g.',
  'a small layered cake baked into a mug with a buttercream top — designed with a simple motif in your color choice. pick any two colors (blue, purple, red, grey, pink, yellow, green) and send us a reference for the design style you like. available through may only.',
  'may special',
  '[
    {"label":"caramel sea salt & almonds","price":449,"desc":"caramel, sea salt, almonds."},
    {"label":"hazelnut","price":469,"desc":"contains hazelnut spread and crushed hazelnuts."},
    {"label":"biscoff","price":479,"desc":"contains biscoff spread and crushed biscoff."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  2
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- Cake in a tea cup with saucer
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'md-teacup', 'mothers-day',
  'Cake in a tea cup',
  'the mug cake''s bigger sibling — with a saucer. 400–500g.',
  'same concept as the mug cake but larger, and it comes with a matching saucer. design in your two chosen colors (blue, purple, red, grey, pink, yellow, green). send us a reference for the design style you like. available through may only.',
  'may special',
  '[
    {"label":"caramel sea salt & almonds","price":639,"desc":"caramel, sea salt, almonds."},
    {"label":"hazelnut","price":689,"desc":"contains hazelnut spread and crushed hazelnuts."},
    {"label":"biscoff","price":709,"desc":"contains biscoff spread and crushed biscoff."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  3
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();

-- Cake in a tub (750ml)
INSERT INTO crumbs_hyd_items (id, cat, name, blurb, more, tag, variants, toppings, images, sort_order)
VALUES (
  'md-tub', 'mothers-day',
  'Cake in a tub',
  'layered cake in a 750ml cardboard tub, buttercream top, designed in your colors. 400–500g.',
  'a layered cake packed into a 750ml cardboard tub with a buttercream top — same design and color choices as the rest of the mother''s day range. pick any two colors (blue, purple, red, grey, pink, yellow, green) and tell us in the DM. available through may only.',
  'may special',
  '[
    {"label":"caramel sea salt & almonds","price":379,"desc":"caramel, sea salt, almonds."},
    {"label":"hazelnut","price":429,"desc":"contains hazelnut spread and crushed hazelnuts."},
    {"label":"biscoff","price":449,"desc":"contains biscoff spread and crushed biscoff."}
  ]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  4
) ON CONFLICT (id) DO UPDATE SET
  cat = EXCLUDED.cat, name = EXCLUDED.name, blurb = EXCLUDED.blurb,
  more = EXCLUDED.more, tag = EXCLUDED.tag, variants = EXCLUDED.variants,
  toppings = EXCLUDED.toppings, images = EXCLUDED.images, updated_at = now();
