/** Crumbs — cart drawer + copy-paste checkout */
const { useState, useEffect, useMemo, useRef } = React;

const buildOrderText = (cart, customer) => {
  const data = window.CRUMBS_DATA;
  const lines = cart.map(l => {
    const it = data.items.find(i => i.id === l.id);
    const v = it.variants[l.vi];
    const tops = (l.toppings || []).map(tid => it.toppings?.find(t => t.id === tid)).filter(Boolean);
    const topPrice = tops.reduce((s, t) => s + t.price, 0);
    const lineUnit = v.price + topPrice;
    const lineTotal = lineUnit * l.qty;
    const topStr = tops.length ? `\n   + toppings: ${tops.map(t => t.label).join(', ')}` : '';
    return `• ${it.name} (${v.label}) × ${l.qty} — ₹${lineTotal.toLocaleString('en-IN')}${topStr}`;
  });
  const total = cart.reduce((s, l) => {
    const it = data.items.find(i => i.id === l.id);
    const tops = (l.toppings || []).map(tid => it.toppings?.find(t => t.id === tid)).filter(Boolean);
    const topPrice = tops.reduce((ss, t) => ss + t.price, 0);
    return s + (it.variants[l.vi].price + topPrice) * l.qty;
  }, 0);
  const parts = [
    `hi crumbs! 🤍 i'd like to place an order:`,
    ``,
    ...lines,
    ``,
    `total — ₹${total.toLocaleString('en-IN')}`,
    ``,
    `name: ${customer.name || '—'}`,
    `phone: ${customer.phone || '—'}`,
    `uber / parcel: ${customer.delivery || '—'}`,
    customer.note ? `note: ${customer.note}` : null,
    ``,
    `please confirm the timing slot, final price & payment details. happy to give 4–12h notice 🤍`,
  ].filter(Boolean);
  return parts.join('\n');
};

const CartDrawer = ({ open, onClose, cart, dispatch, onCheckout }) => {
  const data = window.CRUMBS_DATA;
  const lineUnitPrice = (l) => {
    const it = data.items.find(i => i.id === l.id);
    const tops = (l.toppings || []).map(tid => it.toppings?.find(t => t.id === tid)).filter(Boolean);
    return it.variants[l.vi].price + tops.reduce((s, t) => s + t.price, 0);
  };
  const total = cart.reduce((s,l) => s + lineUnitPrice(l) * l.qty, 0);

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '4px 22px 22px' }}>
        <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>your box</div>
        <div className="serif-italic" style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 18 }}>
          {cart.length === 0 ? 'still empty.' : 'almost there.'}
        </div>

        {cart.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
            add a bake from the menu to start.
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {cart.map((l, idx) => {
                const it = data.items.find(i => i.id === l.id);
                const v = it.variants[l.vi];
                const tops = (l.toppings || []).map(tid => it.toppings?.find(t => t.id === tid)).filter(Boolean);
                return (
                  <div key={`${l.id}-${l.vi}-${l.sig||''}-${idx}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 0', borderBottom: idx < cart.length - 1 ? '1px solid var(--line)' : 0,
                  }}>
                    <ProductMark id={it.id} size={48}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="serif" style={{ fontSize: 16, lineHeight: 1.2 }}>{it.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{v.label} · {fmt(lineUnitPrice(l))}</div>
                      {tops.length > 0 && (
                        <div style={{ fontSize: 11, color: 'var(--red-deep)', marginTop: 2, fontStyle: 'italic' }}>
                          + {tops.map(t => t.label).join(', ')}
                        </div>
                      )}
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 0,
                      background: 'rgba(26,15,11,0.06)', borderRadius: 6, overflow: 'hidden',
                    }}>
                      <button onClick={() => dispatch({ t: 'dec', id: l.id, vi: l.vi, sig: l.sig })} style={{ padding: '6px 10px' }}>
                        <Icon name="minus" size={13}/>
                      </button>
                      <span style={{ minWidth: 18, textAlign: 'center', fontWeight: 600, fontSize: 13 }}>{l.qty}</span>
                      <button onClick={() => dispatch({ t: 'inc', id: l.id, vi: l.vi, sig: l.sig })} style={{ padding: '6px 10px' }}>
                        <Icon name="plus" size={13}/>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 18, padding: '14px 0', borderTop: '1px dashed var(--line)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-2)', marginBottom: 4 }}>
                <span>subtotal</span><span>{fmt(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                <span>uber / parcel</span><span className="serif-italic">confirmed in DM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>total</span>
                <span className="serif" style={{ fontSize: 28, color: 'var(--ink)' }}>{fmt(total)}</span>
              </div>
            </div>

            <button onClick={onCheckout} style={{
              width: '100%', marginTop: 14, padding: '16px',
              background: 'var(--red)', color: 'var(--cream)',
              borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 600,
              letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              place order <Icon name="arrow-right" size={16}/>
            </button>
            <p style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
              we'll prep a quick message you can paste into our DMs. nothing is charged here.
            </p>
          </>
        )}
      </div>
    </Sheet>
  );
};

// ─── CHECKOUT SHEET (copy-paste output) ──────────────────────────────────
const CheckoutSheet = ({ open, onClose, cart, openToast }) => {
  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem('crumbs-customer') || 'null'); } catch { return null; }
  };
  const saved = getSaved();
  const hasSaved = !!(saved?.name && saved?.phone);

  const blank = { name: '', phone: '', delivery: '', note: '' };
  const [customer, setCustomer] = useState(() => saved ? { ...blank, ...saved } : blank);
  const [orderedBefore, setOrderedBefore] = useState(hasSaved);
  const [step, setStep] = useState('form');
  const [copied, setCopied] = useState(false);
  const text = useMemo(() => buildOrderText(cart, customer), [cart, customer]);

  useEffect(() => {
    if (!open) { setStep('form'); setCopied(false); }
    if (open) {
      const s = getSaved();
      if (s) { setCustomer({ ...blank, ...s }); setOrderedBefore(true); }
      else { setCustomer(blank); setOrderedBefore(false); }
    }
  }, [open]);

  const tapOrderedBefore = () => {
    const s = getSaved();
    if (!orderedBefore) {
      if (s) { setCustomer({ ...blank, ...s }); }
      setOrderedBefore(true);
    } else {
      setCustomer(blank);
      setOrderedBefore(false);
      localStorage.removeItem('crumbs-customer');
    }
  };

  const valid = customer.name.trim() && customer.phone.trim();

  const goSummary = () => {
    if (!valid) return;
    const { note, ...rest } = customer;
    localStorage.setItem('crumbs-customer', JSON.stringify({ ...rest, note: '' }));
    setOrderedBefore(true);
    setStep('summary');
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      openToast('copied! now paste into our DM →');
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // fallback — select textarea
      const ta = document.getElementById('cb-text');
      ta?.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const igUrl = `https://ig.me/m/crumbs.hyd`;

  return (
    <Sheet open={open} onClose={onClose}>
      {step === 'form' ? (
        <div style={{ padding: '4px 22px 22px' }}>
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>almost done</div>
          <div className="serif-italic" style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 18 }}>
            {orderedBefore && customer.name ? `welcome back, ${customer.name.split(' ')[0]}.` : 'tell us where this box is going.'}
          </div>

          {/* I've ordered before toggle */}
          <button onClick={tapOrderedBefore} style={{
            width: '100%', marginBottom: 18, padding: '12px 14px',
            background: orderedBefore ? 'rgba(31,138,91,0.08)' : 'rgba(26,15,11,0.04)',
            border: '1px solid ' + (orderedBefore ? 'rgba(31,138,91,0.3)' : 'var(--line)'),
            borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            transition: 'all 0.15s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              background: orderedBefore ? '#1F8A5B' : 'transparent',
              border: '1.5px solid ' + (orderedBefore ? '#1F8A5B' : 'var(--ink-3)'),
              display: 'grid', placeItems: 'center',
            }}>
              {orderedBefore && <Icon name="check" size={13} stroke={2.5}/>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: orderedBefore ? '#1F5C42' : 'var(--ink)' }}>
                i've ordered before
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 1 }}>
                {orderedBefore && customer.name ? `using saved details for ${customer.name}` : 'tap to load your saved details'}
              </div>
            </div>
          </button>

          <Field label="your name" value={customer.name} onChange={v => setCustomer({...customer, name: v})} placeholder="e.g. Anaya"/>
          <Field label="phone" value={customer.phone} onChange={v => setCustomer({...customer, phone: v})} placeholder="10-digit" inputMode="tel"/>
          <Field label="uber / parcel — your area" value={customer.delivery} onChange={v => setCustomer({...customer, delivery: v})} placeholder="share your area — we'll arrange uber or parcel (fee is yours)" multiline/>
          <Field label="any note? (optional)" value={customer.note} onChange={v => setCustomer({...customer, note: v})} placeholder="birthday on the 14th, surprise for…" multiline/>

          <button onClick={goSummary} disabled={!valid} style={{
            width: '100%', marginTop: 8, padding: '16px',
            background: valid ? 'var(--ink)' : 'rgba(26,15,11,0.15)',
            color: valid ? 'var(--cream)' : 'var(--ink-3)',
            borderRadius: 'var(--radius-md)', fontSize: 15, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: valid ? 'pointer' : 'not-allowed',
          }}>
            review & copy <Icon name="arrow-right" size={16}/>
          </button>
        </div>
      ) : (
        <div style={{ padding: '4px 22px 22px' }}>
          <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>your message</div>
          <div className="serif-italic" style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 18 }}>
            copy this. send it to us. we'll do the rest.
          </div>

          <textarea id="cb-text" readOnly value={text} style={{
            width: '100%', minHeight: 240, padding: '16px',
            background: 'var(--cream-warm)', border: '1px dashed rgba(26,15,11,0.18)',
            borderRadius: 'var(--radius-md)', fontFamily: 'inherit',
            fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink)', resize: 'vertical',
          }}/>

          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button onClick={onCopy} style={{
              flex: 1, padding: '14px',
              background: copied ? '#1F8A5B' : 'var(--red)',
              color: 'var(--cream)', borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.2s',
            }}>
              <Icon name={copied ? 'check' : 'copy'} size={16}/>
              {copied ? 'copied!' : 'copy message'}
            </button>
            <button onClick={async () => {
              // Always copy first so user has it even if redirect fails
              try { await navigator.clipboard.writeText(text); }
              catch { const ta = document.getElementById('cb-text'); ta?.select(); document.execCommand('copy'); }
              // Navigate — on mobile this opens the Instagram app directly
              window.location.href = igUrl;
            }} style={{
              flex: 1, padding: '14px', textAlign: 'center',
              background: 'var(--ink)', color: 'var(--cream)',
              borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              open DM <Icon name="arrow-right" size={14}/>
            </button>
          </div>

          {/* Next steps — pulled from "How to" card */}
          <div style={{ marginTop: 24, padding: '16px 18px', background: 'var(--cream-warm)', borderRadius: 'var(--radius-md)' }}>
            <div className="serif" style={{ fontSize: 16, color: 'var(--red)', marginBottom: 10 }}>what happens next</div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.65, color: 'var(--ink-2)' }}>
              <li>we'll reply to confirm your bakes, the timing slot & final price.</li>
              <li>UPI/GPay pre-payment locks it in — share a screenshot of the transfer.</li>
              <li>we'll arrange an uber / parcel to you — delivery fee is yours, paid directly to the rider.</li>
              <li>we'll text you once it's out for delivery.</li>
            </ol>
            <div style={{
              marginTop: 12, padding: '10px 12px', background: 'rgba(255,48,48,0.08)',
              borderRadius: 8, fontSize: 12, color: 'var(--red-deep)', lineHeight: 1.5,
            }}>
              <strong>heads up:</strong> we bake everything fresh — please give us a minimum of <strong>4 to 12 hours</strong> prior notice. exact timing slots are confirmed in DM.
            </div>
          </div>

          <button onClick={() => setStep('form')} style={{
            width: '100%', marginTop: 12, padding: '10px', fontSize: 13, color: 'var(--ink-3)',
          }}>← edit details</button>
        </div>
      )}
    </Sheet>
  );
};

const Field = ({ label, value, onChange, placeholder, multiline, inputMode }) => (
  <label style={{ display: 'block', marginBottom: 16 }}>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: 'var(--ink-3)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
    {multiline ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        rows={2} style={fieldStyle}/>
    ) : (
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        inputMode={inputMode} style={fieldStyle}/>
    )}
  </label>
);

const fieldStyle = {
  width: '100%', padding: '12px 14px',
  background: 'transparent', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-md)', fontFamily: 'inherit',
  fontSize: 14, lineHeight: 1.4, color: 'var(--ink)',
  outline: 'none', resize: 'vertical',
};

// ─── BOTTOM SHEET PRIMITIVE ──────────────────────────────────────────────
const Sheet = ({ open, onClose, children }) => {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(26,15,11,0.45)',
        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s', zIndex: 90,
      }}/>
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        maxWidth: 430, margin: '0 auto',
        background: 'var(--cream)', borderRadius: '24px 24px 0 0',
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        maxHeight: '90vh', overflowY: 'auto', zIndex: 100,
        boxShadow: '0 -20px 60px -10px rgba(0,0,0,0.35)',
      }}>
        <div style={{
          position: 'sticky', top: 0, padding: '12px 16px 8px', background: 'var(--cream)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--line)', zIndex: 1,
        }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(26,15,11,0.18)',
            position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)' }}/>
          <div/>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 999, background: 'rgba(26,15,11,0.06)',
            display: 'grid', placeItems: 'center',
          }}><Icon name="close" size={16}/></button>
        </div>
        {children}
      </div>
    </>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────
const Toast = ({ msg, show }) => (
  <div style={{
    position: 'fixed', left: '50%', bottom: 100, transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
    background: 'var(--ink)', color: 'var(--cream)', padding: '10px 16px',
    borderRadius: 999, fontSize: 13, opacity: show ? 1 : 0,
    transition: 'opacity 0.2s, transform 0.2s', pointerEvents: 'none', zIndex: 200,
    boxShadow: '0 8px 24px -8px rgba(0,0,0,0.4)',
  }}>{msg}</div>
);

window.CartDrawer = CartDrawer;
window.CheckoutSheet = CheckoutSheet;
window.Toast = Toast;
