/** Crumbs menu — main app */
const { useState, useEffect, useMemo, useRef } = React;

// Tiny hash router
const useRoute = () => {
  const get = () => (location.hash.replace(/^#\/?/, '') || 'home');
  const [r, setR] = useState(get);
  useEffect(() => {
    const onH = () => setR(get());
    window.addEventListener('hashchange', onH);
    return () => window.removeEventListener('hashchange', onH);
  }, []);
  return [r, (to) => { location.hash = '#/' + (to === 'home' ? '' : to); }];
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headerStyle": "photo",
  "itemLayout": "card",
  "showMarks": true,
  "ctaStyle": "pill",
  "accent": "#FF3030"
}/*EDITMODE-END*/;

// ─── HOME (/ ) ─────────────────────────────────────────────────────────────
const Home = ({ go }) => {
  const { brand } = window.CRUMBS_DATA;
  return (
    <div style={{ background: 'var(--red)', color: 'var(--cream)', minHeight: '100vh' }}>
      <div style={{ padding: '20px 22px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{brand.name}</div>
        <a href={`https://instagram.com/${brand.handle.replace('@','')}`} target="_blank"
          style={{ color: 'inherit', fontSize: 13, opacity: 0.85, textDecoration: 'none', borderBottom: '1px solid rgba(253,248,232,0.4)' }}>
          {brand.handle}
        </a>
      </div>

      <div style={{ padding: '60px 22px 22px' }}>
        <div className="serif-italic" style={{ fontSize: 17, opacity: 0.75, marginBottom: 14 }}>est. lovingly</div>
        <h1 className="serif" style={{
          fontSize: 'clamp(56px, 16vw, 78px)', lineHeight: 0.92, margin: 0,
          letterSpacing: '-0.025em', fontWeight: 500,
        }}>
          small ways<br/>
          <span className="serif-italic" style={{ fontWeight: 400 }}>of being</span><br/>
          loved.
        </h1>
        <p style={{
          marginTop: 28, fontSize: 15, lineHeight: 1.55, opacity: 0.85, maxWidth: '32ch',
        }}>
          crumbs are proof that a moment existed. cookies, brownies, cakes — baked fresh in Hyderabad, sent in boxes that carry your story.
        </p>
      </div>

      {/* Big serif "MENU" card linking to /menu — homage to the brand reference */}
      <button
        onClick={() => go('menu')}
        style={{
          margin: '8px 22px 0', display: 'block', width: 'calc(100% - 44px)',
          background: 'var(--cream)', color: 'var(--red)',
          borderRadius: 'var(--radius-lg)', padding: '34px 22px 28px',
          textAlign: 'left', boxShadow: '0 12px 30px -16px rgba(0,0,0,0.35)',
        }}
      >
        <div className="serif-italic" style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>tap to open</div>
        <div className="serif" style={{ fontSize: 78, lineHeight: 0.9, letterSpacing: '-0.03em' }}>Menu</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13 }}>
          <span style={{ opacity: 0.75 }}>cookies · brownies · tubs · cakes</span>
          <Icon name="arrow-right" size={18}/>
        </div>
      </button>

      <div style={{ padding: '32px 22px 28px', display: 'grid', gap: 18 }}>
        <Stat label="rated" value="4.9" sub={`${brand.reviews}+ orders`} />
        <Stat label="bake to order" value="4–12h" sub="minimum prior notice, please" />
        <Stat label="based in" value="Mehdipatnam" sub="hyderabad · uber & parcel only" small />
      </div>

      <div style={{
        padding: '20px 22px 28px', borderTop: '1px solid var(--line-cream)',
        fontSize: 12, opacity: 0.7, display: 'flex', justifyContent: 'space-between',
      }}>
        <span>© crumbs.hyd · made with love</span>
        <span className="serif-italic">a moment existed.</span>
      </div>
    </div>
  );
};

const Stat = ({ label, value, sub, small }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingBottom: 14, borderBottom: '1px solid var(--line-cream)' }}>
    <div className="serif" style={{ fontSize: small ? 26 : 44, lineHeight: 1, minWidth: small ? 0 : 90 }}>{value}</div>
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 14, opacity: 0.85 }}>{sub}</div>
    </div>
  </div>
);

window.Home = Home;
window.useRoute = useRoute;
window.TWEAK_DEFAULTS = TWEAK_DEFAULTS;
