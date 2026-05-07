/** Crumbs menu — components */
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const fmt = n => "₹" + n.toLocaleString('en-IN');

// ─── ICONS (hand-stroked, single source of truth) ──────────────────────────
const Icon = ({ name, size = 20, stroke = 1.6 }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case 'back':    return <svg {...p}><path d="M15 5l-7 7 7 7"/></svg>;
    case 'search':  return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'share':   return <svg {...p}><path d="M12 3v13"/><path d="M7 8l5-5 5 5"/><path d="M5 14v6h14v-6"/></svg>;
    case 'heart':   return <svg {...p}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/></svg>;
    case 'plus':    return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>;
    case 'minus':   return <svg {...p}><path d="M5 12h14"/></svg>;
    case 'star':    return <svg {...p} fill="currentColor" stroke="none"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.5 1.3 6.6L12 17.4 6.1 20.5l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>;
    case 'clock':   return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'pin':     return <svg {...p}><path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'close':   return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'cart':    return <svg {...p}><path d="M5 7h15l-2 10H7z"/><path d="M5 7L4 4H2"/><circle cx="9" cy="21" r="1.2"/><circle cx="17" cy="21" r="1.2"/></svg>;
    case 'copy':    return <svg {...p}><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>;
    case 'check':   return <svg {...p}><path d="M5 12l5 5L20 7"/></svg>;
    case 'sparkle': return <svg {...p}><path d="M12 4v6m0 4v6M4 12h6m4 0h6"/></svg>;
    case 'menu':    return <svg {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case 'arrow-right': return <svg {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
  }
  return null;
};

// ─── PRODUCT MARK (placeholder cookie/cake artwork) ───────────────────────
// User said "use elegant placeholders" — these are abstract, on-brand,
// not photo-realistic. One per item id, deterministic.
const ProductMark = ({ id, size = 72 }) => {
  // hash id → palette
  const seed = [...id].reduce((a,c)=>a+c.charCodeAt(0),0);
  const palettes = [
    ['#C2410C','#7C2D12','#FED7AA'], // chocolate chunk
    ['#1F1F1F','#52525B','#F5F5F4'], // cookies & cream
    ['#92400E','#451A03','#FDE68A'], // pb caramel
    ['#65A30D','#365314','#FDE68A'], // pistachio
    ['#9A3412','#451A03','#F5DEB3'], // hazelnut
    ['#854D0E','#3F1D0B','#FEF3C7'], // biscoff
  ];
  const pal = palettes[seed % palettes.length];
  // category-based shape
  const isSquare = /br-|brookie/.test(id);
  const isTub = /tub-/.test(id);
  const isCake = /tres-/.test(id);
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      background: 'rgba(26,15,11,0.04)',
      borderRadius: isSquare ? '14%' : (isTub || isCake) ? '16%' : '50%',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <radialGradient id={`g-${id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor={pal[2]} />
            <stop offset="55%" stopColor={pal[0]} />
            <stop offset="100%" stopColor={pal[1]} />
          </radialGradient>
        </defs>
        {isCake ? (
          <>
            <rect x="10" y="38" width="80" height="46" rx="6" fill={pal[2]} />
            <rect x="10" y="38" width="80" height="14" fill={pal[0]} opacity="0.85"/>
            {[20,35,50,65,80].map((x,i)=><circle key={i} cx={x} cy={42} r="2.5" fill={pal[1]} opacity="0.7"/>)}
          </>
        ) : isTub ? (
          <>
            <rect x="14" y="30" width="72" height="55" rx="4" fill={pal[2]} opacity="0.5" stroke={pal[1]} strokeWidth="1"/>
            <rect x="18" y="40" width="64" height="40" rx="2" fill={`url(#g-${id})`}/>
            <ellipse cx="50" cy="42" rx="32" ry="5" fill={pal[2]} opacity="0.6"/>
          </>
        ) : isSquare ? (
          <>
            <rect x="14" y="14" width="72" height="72" rx="6" fill={`url(#g-${id})`}/>
            <rect x="14" y="14" width="72" height="14" fill={pal[1]} opacity="0.4"/>
            {[[28,40],[55,32],[70,55],[40,68],[60,72]].map(([x,y],i)=>
              <circle key={i} cx={x} cy={y} r={3+(i%2)} fill={pal[1]} opacity="0.8"/>)}
          </>
        ) : (
          <>
            <circle cx="50" cy="50" r="38" fill={`url(#g-${id})`}/>
            {[[35,40,4],[60,38,5],[42,60,3.5],[65,58,4.5],[50,50,3],[30,55,3]].map(([x,y,r],i)=>
              <circle key={i} cx={x} cy={y} r={r} fill={pal[1]} opacity="0.85"/>)}
            {[[38,45],[58,42],[48,58]].map(([x,y],i)=>
              <circle key={i} cx={x} cy={y} r="1.5" fill={pal[2]} opacity="0.6"/>)}
          </>
        )}
      </svg>
    </div>
  );
};

window.Icon = Icon;
window.ProductMark = ProductMark;
window.fmt = fmt;
