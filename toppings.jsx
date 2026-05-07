/** Crumbs — toppings picker sheet */
const { useState: useTState, useEffect: useTEffect } = React;

const ToppingsSheet = ({ open, ctx, onClose, onAdd }) => {
  const [picked, setPicked] = useTState([]);
  useTEffect(() => { if (open) setPicked([]); }, [open, ctx?.item?.id]);

  if (!ctx) return <Sheet open={open} onClose={onClose}><div/></Sheet>;
  const { item, vi } = ctx;
  const v = item.variants[vi];
  const toppings = item.toppings || [];

  const toggle = (tid) => setPicked(p => p.includes(tid) ? p.filter(x => x !== tid) : [...p, tid]);

  const extras = picked.reduce((s, tid) => s + (toppings.find(t => t.id === tid)?.price || 0), 0);
  const total = v.price + extras;

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '4px 22px 22px' }}>
        <div className="serif-italic" style={{ fontSize: 13, color: 'var(--ink-3)' }}>topping it up?</div>
        <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>
          {item.name}
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
          {v.label} · {fmt(v.price)} base. pick as many as you like, or none at all.
        </div>

        <div style={{ display: 'grid', gap: 8 }}>
          {toppings.map(t => {
            const on = picked.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggle(t.id)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left',
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                background: on ? 'rgba(255,48,48,0.08)' : 'transparent',
                border: '1.5px solid ' + (on ? 'var(--red)' : 'var(--line)'),
                color: 'var(--ink)', transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    background: on ? 'var(--red)' : 'transparent',
                    border: '1.5px solid ' + (on ? 'var(--red)' : 'var(--ink-3)'),
                    display: 'grid', placeItems: 'center', color: 'var(--cream)',
                    flexShrink: 0,
                  }}>
                    {on && <Icon name="check" size={13} stroke={2.4}/>}
                  </div>
                  <span style={{ fontSize: 14.5, fontWeight: on ? 600 : 500 }}>{t.label}</span>
                </div>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>+{fmt(t.price)}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 18, padding: '14px 0', borderTop: '1px dashed var(--line)',
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {picked.length === 0 ? 'no toppings' : `${picked.length} ${picked.length === 1 ? 'topping' : 'toppings'} added`}
            </div>
            <div className="serif" style={{ fontSize: 26, color: 'var(--ink)' }}>{fmt(total)}</div>
          </div>
          <button onClick={() => onAdd(picked)} style={{
            padding: '13px 22px', background: 'var(--red)', color: 'var(--cream)',
            borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            add to box <Icon name="arrow-right" size={14}/>
          </button>
        </div>
      </div>
    </Sheet>
  );
};

window.ToppingsSheet = ToppingsSheet;
