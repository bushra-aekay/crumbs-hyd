/** Crumbs menu — /menu Zomato-shaped page */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─── HEADER ──────────────────────────────────────────────────────────────
const MenuHeader = ({ go, scroll, headerStyle }) => {
  const { brand } = window.CRUMBS_DATA;
  const collapsed = scroll > 140;
  return (
    <>
      {/* Top action bar — always sticky, transitions cream → red */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        padding: '14px 16px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: collapsed ? 'var(--cream)' : 'transparent',
        boxShadow: collapsed ? '0 1px 0 var(--line)' : 'none',
        transition: 'background 0.2s, box-shadow 0.2s',
        color: collapsed ? 'var(--ink)' : 'var(--cream)',
      }}>
        <button onClick={() => go('home')} aria-label="back" style={{
          width: 38, height: 38, borderRadius: 999,
          background: collapsed ? 'rgba(26,15,11,0.06)' : 'rgba(0,0,0,0.18)',
          display: 'grid', placeItems: 'center', backdropFilter: 'blur(6px)',
        }}><Icon name="back" size={18}/></button>

        {collapsed && (
          <div className="serif" style={{ fontSize: 18, letterSpacing: '-0.01em' }}>
            {brand.name}
          </div>
        )}

        <div style={{ width: 38 }}/>
      </div>

      {/* Hero — red "Menu" slab, photo or pure type per tweak */}
      <div style={{
        marginTop: -52, padding: '76px 22px 28px',
        background: 'var(--red)', color: 'var(--cream)',
        position: 'relative', overflow: 'hidden',
      }}>
        {headerStyle === 'photo' && (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.18), transparent 55%),
                         radial-gradient(ellipse at 10% 90%, rgba(0,0,0,0.22), transparent 60%)`,
          }}/>
        )}
        <div style={{ position: 'relative' }}>
          <div className="serif-italic" style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>the entire</div>
          <h1 className="serif" style={{
            margin: 0, fontSize: 'clamp(86px, 24vw, 120px)', lineHeight: 0.85,
            letterSpacing: '-0.035em', fontWeight: 500,
          }}>Menu</h1>

          <div style={{ marginTop: 22, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Pill icon="star" text={`${brand.rating} · ${brand.reviews}+ orders`}/>
            <Pill icon="pin" text={brand.location}/>
            <Pill icon="clock" text="uber / rapido · order ahead"/>
          </div>

          <p className="serif-italic" style={{
            marginTop: 18, fontSize: 16, lineHeight: 1.45, opacity: 0.92, maxWidth: '32ch',
          }}>
            “crumbs are proof <br/>that a moment existed.”
          </p>
        </div>
      </div>
    </>
  );
};

const Pill = ({ icon, text }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 10px 5px 8px', borderRadius: 999,
    background: 'rgba(253,248,232,0.14)', border: '1px solid rgba(253,248,232,0.22)',
    fontSize: 12, lineHeight: 1.2,
  }}>
    <Icon name={icon} size={13}/>
    <span>{text}</span>
  </div>
);

// ─── SEARCH + CATEGORY TABS ──────────────────────────────────────────────
const CategoryBar = ({ active, onSelect, q, setQ, favOnly, setFavOnly, favCount }) => {
  const cats = window.CRUMBS_DATA.categories;
  const scrollRef = useRef(null);
  // Scroll active tab into view
  useEffect(() => {
    if (favOnly) return;
    const el = scrollRef.current?.querySelector(`[data-cat="${active}"]`);
    if (el) el.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [active, favOnly]);

  return (
    <div style={{
      position: 'sticky', top: 62, zIndex: 15, background: 'var(--cream)',
      paddingTop: 12, paddingBottom: 0,
      boxShadow: '0 1px 0 var(--line)',
    }}>
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 10 }}>
        <label style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', borderRadius: 999,
          background: 'rgba(26,15,11,0.04)', border: '1px solid var(--line)',
        }}>
          <Icon name="search" size={16}/>
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="search bakes…"
            style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontSize: 14, minWidth: 0 }}
          />
          {q && <button onClick={() => setQ('')} style={{ opacity: 0.6 }}><Icon name="close" size={14}/></button>}
        </label>
        <button onClick={() => setFavOnly(f => !f)} aria-label="favourites" style={{
          width: 44, height: 44, borderRadius: 999,
          background: favOnly ? 'var(--red)' : 'rgba(26,15,11,0.04)',
          color: favOnly ? 'var(--cream)' : 'var(--ink-2)',
          border: '1px solid ' + (favOnly ? 'var(--red)' : 'var(--line)'),
          display: 'grid', placeItems: 'center', position: 'relative',
          flexShrink: 0, transition: 'all 0.15s',
        }}>
          <HeartIcon filled={favOnly}/>
          {!favOnly && favCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, minWidth: 16, height: 16,
              padding: '0 4px', borderRadius: 999, background: 'var(--red)', color: 'var(--cream)',
              fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center',
            }}>{favCount}</span>
          )}
        </button>
      </div>
      <div ref={scrollRef} className="no-scrollbar" style={{
        display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 12px', scrollSnapType: 'x proximity',
        opacity: favOnly ? 0.4 : 1, pointerEvents: favOnly ? 'none' : 'auto',
      }}>
        {cats.map(c => (
          <button key={c.id} data-cat={c.id} onClick={() => onSelect(c.id)} style={{
            padding: '8px 14px', borderRadius: 999, whiteSpace: 'nowrap',
            background: active === c.id ? 'var(--ink)' : 'transparent',
            color: active === c.id ? 'var(--cream)' : 'var(--ink-2)',
            border: '1px solid ' + (active === c.id ? 'var(--ink)' : 'var(--line)'),
            fontSize: 13, fontWeight: 500, scrollSnapAlign: 'center',
            transition: 'background 0.15s',
          }}>{c.label}</button>
        ))}
      </div>
    </div>
  );
};

// ─── ITEM ROW ────────────────────────────────────────────────────────────
// ─── IMAGE GALLERY OVERLAY ───────────────────────────────────────────────────
const ImageGallery = ({ images, startIdx = 0, onClose }) => {
  const [idx, setIdx] = useState(startIdx);
  const touchX = useRef(null);
  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)',
      zIndex: 300, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '20px',
    }}>
      <button onClick={e => { e.stopPropagation(); onClose(); }} style={{
        position: 'absolute', top: 16, right: 20,
        color: 'rgba(255,255,255,0.7)', fontSize: 30, lineHeight: 1,
      }}>×</button>

      <img
        src={images[idx]} alt=""
        onClick={e => e.stopPropagation()}
        onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const diff = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
          touchX.current = null;
        }}
        style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: 12, userSelect: 'none' }}
      />

      {images.length > 1 && (
        <>
          <div style={{ marginTop: 14, color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            {idx + 1} / {images.length}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
            {[['←', prev], ['→', next]].map(([label, fn]) => (
              <button key={label} onClick={e => { e.stopPropagation(); fn(); }} style={{
                width: 44, height: 44, borderRadius: 999,
                background: 'rgba(255,255,255,0.14)', color: '#fff',
                display: 'grid', placeItems: 'center', fontSize: 18,
              }}>{label}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── ITEM ROW ────────────────────────────────────────────────────────────────
const ItemRow = ({ item, qtyOf, onAdd, onInc, onDec, onOpenGallery, fav, onToggleFav, showMarks, layout, ctaStyle }) => {
  const [variantIdx, setVariantIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const v = item.variants[variantIdx];
  // Per-variant qty — fixes the "variant 1 in cart makes variant 2 look in-cart" bug
  const qty = qtyOf(variantIdx);
  const inCart = qty > 0;
  const hasMore = !!item.more;
  const hasToppings = item.toppings?.length > 0;
  const hasImages = item.images?.length > 0;

  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'flex-start',
      padding: layout === 'card' ? '16px' : '18px 0',
      background: layout === 'card' ? '#fff' : 'transparent',
      borderRadius: layout === 'card' ? 'var(--radius-md)' : 0,
      borderBottom: layout === 'card' ? 0 : '1px solid var(--line)',
      boxShadow: layout === 'card' ? 'var(--shadow-card)' : 'none',
      position: 'relative',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {item.tag && (
              <div className="serif-italic" style={{ fontSize: 12, color: 'var(--red-deep)', marginBottom: 4 }}>
                ✦ {item.tag}
              </div>
            )}
            <div className="serif" style={{ fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.01em' }}>
              {item.name}
            </div>
          </div>
          <button onClick={() => onToggleFav(item.id)} aria-label="favourite" style={{
            width: 30, height: 30, display: 'grid', placeItems: 'center',
            color: fav ? 'var(--red)' : 'var(--ink-3)',
            transition: 'transform 0.15s, color 0.15s',
            transform: fav ? 'scale(1.05)' : 'scale(1)',
          }}>
            <HeartIcon filled={fav}/>
          </button>
        </div>

        {/* Blurb — shows variant desc if set, otherwise item blurb */}
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45, marginBottom: 6 }}>
          {v.desc || item.blurb}
        </div>

        {hasMore && (
          <>
            <div style={{ maxHeight: expanded ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55, paddingTop: 4, paddingBottom: 8 }}>
                {item.more}
              </div>
            </div>
            <button onClick={() => setExpanded(x => !x)} style={{
              fontSize: 11.5, color: 'var(--red)', fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              padding: '0 0 8px', display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              {expanded ? 'see less' : 'see more'}
              <span style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block', fontSize: 9 }}>▾</span>
            </button>
          </>
        )}

        {/* Variant pills — each tracks its own qty independently */}
        {item.variants.length > 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, marginTop: 4 }}>
            {item.variants.map((vv, i) => (
              <button key={i} onClick={() => setVariantIdx(i)} style={{
                padding: '4px 10px', borderRadius: 999, fontSize: 11.5,
                background: i === variantIdx ? 'var(--ink)' : 'transparent',
                color: i === variantIdx ? 'var(--cream)' : 'var(--ink-2)',
                border: '1px solid ' + (i === variantIdx ? 'var(--ink)' : 'var(--line)'),
              }}>{vv.label} · {fmt(vv.price)}</button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
          <span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>{fmt(v.price)}</span>
          {item.variants.length === 1 && (
            <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {v.label}</span>
          )}
        </div>
      </div>

      {/* Right column — image (or mark) + add control */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {hasImages ? (
          <button onClick={() => onOpenGallery(item.images, 0)} style={{
            width: 84, height: 84, borderRadius: 12, overflow: 'hidden',
            position: 'relative', display: 'block', flexShrink: 0,
          }}>
            <img src={item.images[0]} alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            {item.images.length > 1 && (
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                background: 'rgba(0,0,0,0.55)', color: '#fff',
                fontSize: 9, padding: '2px 5px', borderRadius: 999, fontWeight: 600,
              }}>1/{item.images.length}</div>
            )}
          </button>
        ) : showMarks ? (
          <ProductMark id={item.id} size={84}/>
        ) : null}

        {/* For topping items: always show add (re-opens sheet) + count */}
        {hasToppings ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {inCart && (
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>
                {qty} added
              </div>
            )}
            <button onClick={() => onAdd(item.id, variantIdx)}
              style={ctaStyle === 'pill' ? {
                background: 'var(--cream)', color: 'var(--red)', border: '1.5px solid var(--red)',
                padding: '8px 14px', borderRadius: 6, fontWeight: 600, fontSize: 13,
                letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 2px 0 var(--red)',
              } : {
                background: 'var(--red)', color: 'var(--cream)',
                padding: '9px 16px', borderRadius: 6, fontWeight: 600, fontSize: 13,
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>
              {inCart ? '+ more' : 'add'}
            </button>
          </div>
        ) : !inCart ? (
          <button onClick={() => onAdd(item.id, variantIdx)}
            style={ctaStyle === 'pill' ? {
              background: 'var(--cream)', color: 'var(--red)', border: '1.5px solid var(--red)',
              padding: '8px 20px', borderRadius: 6, fontWeight: 600, fontSize: 13,
              letterSpacing: '0.06em', textTransform: 'uppercase', boxShadow: '0 2px 0 var(--red)',
            } : {
              background: 'var(--red)', color: 'var(--cream)',
              padding: '9px 22px', borderRadius: 6, fontWeight: 600, fontSize: 13,
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
            add
          </button>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'var(--red)', color: 'var(--cream)',
            borderRadius: 6, overflow: 'hidden',
            boxShadow: '0 2px 0 rgba(225,26,26,0.4)',
          }}>
            <button onClick={() => onDec(item.id, variantIdx)} style={{ padding: '8px 12px', display: 'grid', placeItems: 'center' }}>
              <Icon name="minus" size={14}/>
            </button>
            <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>{qty}</span>
            <button onClick={() => onInc(item.id, variantIdx)} style={{ padding: '8px 12px', display: 'grid', placeItems: 'center' }}>
              <Icon name="plus" size={14}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Filled/outline heart for favorites
const HeartIcon = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
  </svg>
);

// ─── SECTION HEADER ──────────────────────────────────────────────────────
const SectionHeader = ({ id, label, count }) => (
  <div id={`sec-${id}`} style={{
    padding: '32px 0 14px', display: 'flex', alignItems: 'baseline', gap: 10,
    borderBottom: '1px solid var(--line)', marginBottom: 4,
  }}>
    <h2 className="serif" style={{
      margin: 0, fontSize: 34, letterSpacing: '-0.02em', fontWeight: 500, color: 'var(--red)',
    }}>{label}</h2>
    <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{count} {count === 1 ? 'bake' : 'bakes'}</span>
  </div>
);

// ─── MENU PAGE ────────────────────────────────────────────────────────────
const Menu = ({ go, tweaks, cart, dispatch, openCart, openToast, favs, toggleFav }) => {
  const [scroll, setScroll] = useState(0);
  const [active, setActive] = useState('cookies');
  const [q, setQ] = useState('');
  const [favOnly, setFavOnly] = useState(false);
  const [toppingsFor, setToppingsFor] = useState(null);
  const [gallery, setGallery] = useState(null);
  const scrollRef = useRef(null);
  const data = window.CRUMBS_DATA;

  const filtered = useMemo(() => {
    let items = data.items;
    if (favOnly) items = items.filter(it => favs.includes(it.id));
    const ql = q.trim().toLowerCase();
    if (ql) items = items.filter(it =>
      it.name.toLowerCase().includes(ql) || it.blurb.toLowerCase().includes(ql)
    );
    return items;
  }, [q, favOnly, favs]);

  const grouped = useMemo(() => {
    const g = {};
    data.categories.forEach(c => g[c.id] = []);
    filtered.forEach(it => g[it.cat]?.push(it));
    return g;
  }, [filtered]);

  // Update active section based on scroll position
  const onScroll = useCallback((e) => {
    const top = e.currentTarget.scrollTop;
    setScroll(top);
    if (q) return;
    let cur = data.categories[0].id;
    for (const c of data.categories) {
      const el = document.getElementById(`sec-${c.id}`);
      if (el && el.getBoundingClientRect().top < 200) cur = c.id;
    }
    setActive(cur);
  }, [q]);

  const onJump = (id) => {
    setActive(id);
    const container = scrollRef.current;
    const el = document.getElementById(`sec-${id}`);
    if (container && el) {
      const offset = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
      container.scrollBy({ top: offset - 120, behavior: 'smooth' });
    }
  };

  const makeQtyOf = (id) => (vi) => cart.filter(l => l.id === id && l.vi === vi).reduce((s,l)=>s+l.qty,0);
  const onAdd = (id, vi) => {
    const item = data.items.find(i => i.id === id);
    if (item?.toppings?.length) {
      setToppingsFor({ item, vi });
      return;
    }
    dispatch({ t: 'add', id, vi });
    openToast('added · open cart to review');
  };
  const onAddWithToppings = (toppings) => {
    if (!toppingsFor) return;
    dispatch({ t: 'add', id: toppingsFor.item.id, vi: toppingsFor.vi, toppings });
    openToast('added · with your toppings');
    setToppingsFor(null);
  };
  const onInc = (id, vi) => dispatch({ t: 'inc', id, vi });
  const onDec = (id, vi) => dispatch({ t: 'dec', id, vi });
  const onToggleFav = (id) => { toggleFav(id); openToast(favs.includes(id) ? 'removed from favourites' : 'saved to favourites'); };

  // Only count items that still exist in the live menu
  const liveCart = cart.filter(l => data.items.find(i => i.id === l.id));
  const totalQty = liveCart.reduce((s, l) => s + l.qty, 0);
  const totalAmt = liveCart.reduce((s, l) => {
    const item = data.items.find(i => i.id === l.id);
    return s + (item?.variants[l.vi]?.price || 0) * l.qty;
  }, 0);

  return (
    <div ref={scrollRef} onScroll={onScroll} style={{ height: '100vh', overflowY: 'auto', background: 'var(--cream)' }}>
      <MenuHeader go={go} scroll={scroll} headerStyle={tweaks.headerStyle}/>
      <CategoryBar active={active} onSelect={onJump} q={q} setQ={setQ}
        favOnly={favOnly} setFavOnly={setFavOnly} favCount={favs.length}/>

      <div style={{
        padding: tweaks.itemLayout === 'card' ? '0 14px 140px' : '0 22px 140px',
        display: 'flex', flexDirection: 'column',
        gap: tweaks.itemLayout === 'card' ? 12 : 0,
      }}>
        {data.categories.map(c => {
          const items = grouped[c.id] || [];
          if (items.length === 0) return null;
          return (
            <React.Fragment key={c.id}>
              <SectionHeader id={c.id} label={c.label} count={items.length}/>
              {tweaks.itemLayout === 'card' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  {items.map(it => (
                    <ItemRow key={it.id} item={it}
                      qtyOf={makeQtyOf(it.id)}
                      onAdd={onAdd} onInc={onInc} onDec={onDec}
                      onOpenGallery={(imgs, idx) => setGallery({ images: imgs, idx })}
                      fav={favs.includes(it.id)} onToggleFav={onToggleFav}
                      showMarks={tweaks.showMarks} layout={tweaks.itemLayout} ctaStyle={tweaks.ctaStyle}/>
                  ))}
                </div>
              ) : (
                items.map(it => (
                  <ItemRow key={it.id} item={it}
                    qtyOf={makeQtyOf(it.id)}
                    onAdd={onAdd} onInc={onInc} onDec={onDec}
                    onOpenGallery={(imgs, idx) => setGallery({ images: imgs, idx })}
                    fav={favs.includes(it.id)} onToggleFav={onToggleFav}
                    showMarks={tweaks.showMarks} layout={tweaks.itemLayout} ctaStyle={tweaks.ctaStyle}/>
                ))
              )}
            </React.Fragment>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
            <div className="serif-italic" style={{ fontSize: 22, marginBottom: 6 }}>
              {favOnly ? 'no favourites yet.' : 'nothing here yet.'}
            </div>
            <div style={{ fontSize: 13 }}>
              {favOnly ? 'tap the heart on a bake to save it here.' : 'try a different word, or DM us — we might have it.'}
            </div>
          </div>
        )}

        {/* Allergy note — pulled from brand cards */}
        <div style={{
          marginTop: 36, padding: '16px 18px', borderRadius: 'var(--radius-md)',
          background: 'rgba(255,48,48,0.06)', color: 'var(--red-deep)',
          fontSize: 12, lineHeight: 1.5,
        }}>
          <strong style={{ fontWeight: 600 }}>a small note:</strong> all our bakes contain egg & traces of nuts. tell us about allergies or dietary needs in your DM and we'll figure something out.
        </div>

        <div style={{ marginTop: 24, textAlign: 'center', color: 'var(--ink-3)' }}>
          <div className="serif-italic" style={{ fontSize: 18 }}>that's everything, for now.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>new bakes drop on instagram — {data.brand.handle}</div>
        </div>
      </div>

      {/* Cart bar */}
      {totalQty > 0 && (
        <button onClick={openCart} style={{
          position: 'fixed', left: '50%', bottom: 16, transform: 'translateX(-50%)',
          width: 'min(calc(100% - 32px), 398px)', zIndex: 30,
          background: 'var(--ink)', color: 'var(--cream)', borderRadius: 'var(--radius-lg)',
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 18px 40px -16px rgba(0,0,0,0.45)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <div style={{
              minWidth: 22, height: 22, borderRadius: 999, background: 'var(--red)',
              display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 600,
            }}>{totalQty}</div>
            <span>{totalQty === 1 ? '1 bake' : `${totalQty} bakes`} · {fmt(totalAmt)}</span>
          </div>
          <span style={{ fontSize: 13, opacity: 0.85, display: 'flex', alignItems: 'center', gap: 6 }}>
            review order <Icon name="arrow-right" size={14}/>
          </span>
        </button>
      )}
      {/* Image gallery overlay */}
      {gallery && (
        <ImageGallery images={gallery.images} startIdx={gallery.idx} onClose={() => setGallery(null)}/>
      )}

      {/* Toppings picker */}
      <ToppingsSheet open={!!toppingsFor} ctx={toppingsFor}
        onClose={() => setToppingsFor(null)}
        onAdd={onAddWithToppings}/>

    </div>
  );
};

window.Menu = Menu;
