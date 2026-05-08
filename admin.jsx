/** Crumbs — admin panel at #/crumbs-kitchen-secrets-admin */
const { useState: useAS, useEffect: useAE, useRef: useAR } = React;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
const newVariant = () => ({ label: '', price: 0, desc: '' });
const newTopping = () => ({ id: 'top-' + Date.now().toString(36), label: '', price: 0 });

const adminCall = async (fn, params) => {
  const db = window.crumbsDB;
  if (!db) throw new Error('Supabase not initialised');
  const { error } = await db.rpc(fn, params);
  if (error) throw error;
};

// ─── GATE ─────────────────────────────────────────────────────────────────────
const AdminGate = ({ onEnter }) => {
  const [pc, setPc] = useAS('');
  const [err, setErr] = useAS('');
  const [busy, setBusy] = useAS(false);
  const [show, setShow] = useAS(false);

  const verify = async () => {
    if (!pc.trim()) return;
    setBusy(true); setErr('');
    try {
      const db = window.crumbsDB;
      if (!db) { setErr('supabase not connected'); setBusy(false); return; }

      let isValid = false;

      // Try the RPC first (available after running supabase-admin-functions.sql)
      const { data: rpcData, error: rpcErr } = await db.rpc('crumbs_hyd_admin_check', { p_passcode: pc.trim() });
      if (!rpcErr) {
        isValid = !!rpcData;
      } else {
        // RPC not set up yet — fall back to direct config table read
        const { data: cfg, error: cfgErr } = await db
          .from('crumbs_hyd_config').select('admin_passcode').eq('id', 1).single();
        if (cfgErr) { setErr('could not reach supabase — check your connection.'); setBusy(false); return; }
        isValid = cfg?.admin_passcode === pc.trim();
      }

      if (!isValid) { setErr('wrong passcode — try again.'); setBusy(false); return; }
      localStorage.setItem('crumbs-admin-pc', pc.trim());
      onEnter(pc.trim());
    } catch (e) {
      setErr('connection error: ' + (e.message || 'check supabase setup'));
    }
    setBusy(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)', color: 'var(--cream)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
    }}>
      <div className="serif" style={{ fontSize: 38, letterSpacing: '-0.02em', marginBottom: 6 }}>
        Crumbs.hyd
      </div>
      <div className="serif-italic" style={{ fontSize: 15, opacity: 0.55, marginBottom: 48 }}>
        kitchen secrets
      </div>

      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(253,248,232,0.5)', marginBottom: 8, fontWeight: 600 }}>
          passcode
        </div>
        <div style={{ display: 'flex', gap: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1.5px solid rgba(253,248,232,0.18)' }}>
          <input
            type={show ? 'text' : 'password'}
            value={pc}
            onChange={e => setPc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && verify()}
            placeholder="enter passcode…"
            style={{
              flex: 1, padding: '14px 16px', background: 'rgba(253,248,232,0.06)',
              border: 0, outline: 0, fontSize: 15, color: 'var(--cream)',
              fontFamily: 'inherit',
            }}
          />
          <button onClick={() => setShow(s => !s)} style={{
            padding: '0 14px', background: 'rgba(253,248,232,0.06)',
            color: 'rgba(253,248,232,0.45)', fontSize: 12,
          }}>
            {show ? 'hide' : 'show'}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 10, fontSize: 13, color: 'var(--red)', opacity: 0.9 }}>{err}</div>
        )}

        <button onClick={verify} disabled={busy} style={{
          width: '100%', marginTop: 16, padding: '15px',
          background: busy ? 'rgba(255,48,48,0.5)' : 'var(--red)',
          color: 'var(--cream)', borderRadius: 'var(--radius-md)',
          fontSize: 14, fontWeight: 600, letterSpacing: '0.04em',
          cursor: busy ? 'not-allowed' : 'pointer',
        }}>
          {busy ? 'checking…' : 'enter kitchen'}
        </button>
      </div>

      <div style={{ marginTop: 48, fontSize: 11, opacity: 0.25, textAlign: 'center' }}>
        if you're not crumbs admin, you probably shouldn't be here.
      </div>
    </div>
  );
};

// ─── ITEM EDIT SHEET ──────────────────────────────────────────────────────────
const ItemEditSheet = ({ open, item, cats, passcode, onClose, onSave, onDelete }) => {
  const isNew = !item?.id || item._new;
  const blank = { id: '', cat: cats[0]?.id || '', name: '', blurb: '', more: '', tag: '', variants: [newVariant()], toppings: [], images: [], _new: true };
  const [form, setForm] = useAS(blank);
  const [busy, setBusy] = useAS(false);
  const [err, setErr] = useAS('');
  const [confirmDel, setConfirmDel] = useAS(false);

  useAE(() => {
    if (open) { setForm(item ? { ...item, variants: [...(item.variants||[])], toppings: [...(item.toppings||[])], images: [...(item.images||[])] } : blank); setErr(''); setConfirmDel(false); }
  }, [open, item]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setVar = (i, k, v) => setForm(f => ({ ...f, variants: f.variants.map((vv, idx) => idx === i ? { ...vv, [k]: k === 'price' ? Number(v)||0 : v } : vv) }));
  const setTop = (i, k, v) => setForm(f => ({ ...f, toppings: f.toppings.map((t, idx) => idx === i ? { ...t, [k]: k === 'price' ? Number(v)||0 : v } : t) }));
  const addVar = () => setForm(f => ({ ...f, variants: [...f.variants, newVariant()] }));
  const removeVar = (i) => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));
  const addTop = () => setForm(f => ({ ...f, toppings: [...f.toppings, newTopping()] }));
  const removeTop = (i) => setForm(f => ({ ...f, toppings: f.toppings.filter((_, idx) => idx !== i) }));

  const [uploading, setUploading] = useAS(false);
  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const db = window.crumbsDB;
      const ext = file.name.split('.').pop().toLowerCase();
      const filename = `${(form.id || 'new').replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.${ext}`;
      const { error } = await db.storage.from('crumbs-hyd-images').upload(filename, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = db.storage.from('crumbs-hyd-images').getPublicUrl(filename);
      setForm(f => ({ ...f, images: [...f.images, publicUrl] }));
    } catch (e) {
      setErr('upload failed: ' + (e.message || 'try again'));
    }
    setUploading(false);
  };
  const removeImage = async (i) => {
    const url = form.images[i];
    try {
      const db = window.crumbsDB;
      const filename = url.split('/').pop();
      await db.storage.from('crumbs-hyd-images').remove([filename]);
    } catch {}
    setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));
  };

  const save = async () => {
    if (!form.name.trim() || !form.cat) { setErr('name and category required'); return; }
    if (!form.variants.length || form.variants.some(v => !v.label.trim())) { setErr('each variant needs a label'); return; }
    setBusy(true); setErr('');
    try {
      const itemId = (isNew || !form.id) ? slugify(form.name) : form.id;
      const sortOrder = window.CRUMBS_DATA.items.filter(i => i.cat === form.cat).length + 100;
      await adminCall('crumbs_hyd_upsert_item', {
        p_passcode: passcode,
        p_id: itemId,
        p_cat: form.cat,
        p_name: form.name.trim(),
        p_blurb: form.blurb.trim(),
        p_more: form.more.trim(),
        p_tag: (form.tag || '').trim() || null,
        p_variants: form.variants,
        p_toppings: form.toppings,
        p_sort_order: sortOrder,
        p_images: form.images,
      });
      onSave();
    } catch (e) { setErr(e.message || 'save failed'); }
    setBusy(false);
  };

  const del = async () => {
    setBusy(true);
    try { await adminCall('crumbs_hyd_delete_item', { p_passcode: passcode, p_id: form.id }); onDelete(); }
    catch (e) { setErr(e.message || 'delete failed'); setBusy(false); }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '4px 22px 32px' }}>
        <div className="serif" style={{ fontSize: 26, marginBottom: 18 }}>
          {isNew ? 'new item' : 'edit item'}
        </div>

        <AField label="category">
          <select value={form.cat} onChange={e => set('cat', e.target.value)} style={aFieldStyle}>
            {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </AField>

        <AField label="name">
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Choco-chunk cookie" style={aFieldStyle}/>
        </AField>

        <AField label="tag (optional — e.g. bestseller)">
          <input value={form.tag || ''} onChange={e => set('tag', e.target.value)} placeholder="leave blank for none" style={aFieldStyle}/>
        </AField>

        <AField label="short blurb">
          <textarea value={form.blurb || ''} onChange={e => set('blurb', e.target.value)} rows={2} placeholder="one punchy line shown in menu…" style={aFieldStyle}/>
        </AField>

        <AField label="full description (see more)">
          <textarea value={form.more || ''} onChange={e => set('more', e.target.value)} rows={3} placeholder="expanded detail when customer taps 'see more'…" style={aFieldStyle}/>
        </AField>

        {/* Variants */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
            variants & prices
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {form.variants.map((v, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingBottom: 10, borderBottom: '1px dashed var(--line)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={v.label} onChange={e => setVar(i, 'label', e.target.value)}
                    placeholder="label (e.g. classic, box of 6)" style={{ ...aFieldStyle, flex: 2, minWidth: 0, width: 'auto' }}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 60, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, color: 'var(--ink-3)', fontSize: 14 }}>₹</span>
                    <input type="number" value={v.price} onChange={e => setVar(i, 'price', e.target.value)}
                      min={0} style={{ ...aFieldStyle, paddingLeft: 24, width: '100%' }}/>
                  </div>
                  {form.variants.length > 1 && (
                    <button onClick={() => removeVar(i)} style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(255,48,48,0.1)', color: 'var(--red)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon name="close" size={14}/>
                    </button>
                  )}
                </div>
                <input value={v.desc || ''} onChange={e => setVar(i, 'desc', e.target.value)}
                  placeholder="flavour description (optional — shown in menu when this variant is selected)"
                  style={{ ...aFieldStyle, fontSize: 12 }}/>
              </div>
            ))}
          </div>
          <button onClick={addVar} style={{
            marginTop: 8, padding: '7px 12px', fontSize: 12, fontWeight: 600,
            color: 'var(--red)', border: '1.5px dashed rgba(255,48,48,0.4)',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="plus" size={13}/> add variant
          </button>
        </div>

        {/* Photos */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
            photos (optional)
          </div>
          {form.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }}/>
                  <button onClick={() => removeImage(i)} style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: 999,
                    background: 'var(--red)', color: '#fff',
                    fontSize: 12, display: 'grid', placeItems: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: uploading ? 'wait' : 'pointer' }}>
            <input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} style={{ display: 'none' }}/>
            <span style={{
              padding: '7px 12px', fontSize: 12, fontWeight: 600,
              color: uploading ? 'var(--ink-3)' : 'var(--ink-2)',
              border: '1.5px dashed var(--line)', borderRadius: 8,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="plus" size={13}/> {uploading ? 'uploading…' : 'add photo'}
            </span>
          </label>
        </div>

        {/* Toppings */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 10 }}>
            toppings (optional)
          </div>
          {form.toppings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
              {form.toppings.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input value={t.label} onChange={e => setTop(i, 'label', e.target.value)}
                    placeholder="topping label" style={{ ...aFieldStyle, flex: 2 }}/>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 10, color: 'var(--ink-3)', fontSize: 14 }}>₹</span>
                    <input type="number" value={t.price} onChange={e => setTop(i, 'price', e.target.value)}
                      min={0} style={{ ...aFieldStyle, paddingLeft: 24, flex: 1 }}/>
                  </div>
                  <button onClick={() => removeTop(i)} style={{ width: 30, height: 30, borderRadius: 999, background: 'rgba(255,48,48,0.1)', color: 'var(--red)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon name="close" size={14}/>
                  </button>
                </div>
              ))}
            </div>
          )}
          <button onClick={addTop} style={{
            padding: '7px 12px', fontSize: 12, fontWeight: 600,
            color: 'var(--ink-2)', border: '1.5px dashed var(--line)',
            borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="plus" size={13}/> add topping
          </button>
        </div>

        {err && <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--red)' }}>{err}</div>}

        {confirmDel ? (
          <div style={{ background: 'rgba(255,48,48,0.07)', border: '1px solid rgba(255,48,48,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 12 }}>
              delete "{form.name}"? this can't be undone.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={del} disabled={busy} style={{
                flex: 1, padding: '12px', background: 'var(--red)', color: 'var(--cream)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              }}>{busy ? 'deleting…' : 'yes, delete'}</button>
              <button onClick={() => setConfirmDel(false)} disabled={busy} style={{
                flex: 1, padding: '12px', background: 'rgba(26,15,11,0.06)', color: 'var(--ink)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              }}>cancel</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} disabled={busy} style={{
              flex: 1, padding: '14px', background: busy ? 'rgba(26,15,11,0.4)' : 'var(--ink)',
              color: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
            }}>
              {busy ? 'saving…' : 'save item'}
            </button>
            {!isNew && (
              <button onClick={() => setConfirmDel(true)} disabled={busy} style={{
                padding: '14px 16px', background: 'rgba(255,48,48,0.08)', color: 'var(--red)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              }}>
                delete
              </button>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
};

// ─── CATEGORY EDIT SHEET ──────────────────────────────────────────────────────
const CatEditSheet = ({ open, cat, passcode, existingCount, onClose, onSave, onDelete }) => {
  const isNew = !cat?.id || cat._new;
  const [label, setLabel] = useAS('');
  const [busy, setBusy] = useAS(false);
  const [err, setErr] = useAS('');
  const [confirmDel, setConfirmDel] = useAS(false);

  useAE(() => {
    if (open) { setLabel(cat?.label || ''); setErr(''); setConfirmDel(false); }
  }, [open, cat]);

  const save = async () => {
    if (!label.trim()) { setErr('label required'); return; }
    setBusy(true); setErr('');
    try {
      const catId = (isNew || !cat?.id) ? slugify(label) : cat.id;
      await adminCall('crumbs_hyd_upsert_category', {
        p_passcode: passcode,
        p_id: catId,
        p_label: label.trim(),
        p_sort_order: cat?.sort_order ?? (existingCount + 1),
      });
      onSave();
    } catch (e) { setErr(e.message || 'save failed'); }
    setBusy(false);
  };

  const del = async () => {
    setBusy(true);
    try { await adminCall('crumbs_hyd_delete_category', { p_passcode: passcode, p_id: cat.id }); onDelete(); }
    catch (e) { setErr(e.message || 'delete failed'); setBusy(false); }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div style={{ padding: '4px 22px 32px' }}>
        <div className="serif" style={{ fontSize: 26, marginBottom: 18 }}>
          {isNew ? 'new category' : 'edit category'}
        </div>
        <AField label="category name">
          <input value={label} onChange={e => setLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()}
            placeholder="e.g. Seasonal specials" style={aFieldStyle}/>
        </AField>
        {err && <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--red)' }}>{err}</div>}
        {confirmDel ? (
          <div style={{ background: 'rgba(255,48,48,0.07)', border: '1px solid rgba(255,48,48,0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--red)', marginBottom: 12 }}>
              delete "{cat?.label}"? all items in it will be deleted too.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={del} disabled={busy} style={{
                flex: 1, padding: '12px', background: 'var(--red)', color: 'var(--cream)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              }}>{busy ? 'deleting…' : 'yes, delete'}</button>
              <button onClick={() => setConfirmDel(false)} disabled={busy} style={{
                flex: 1, padding: '12px', background: 'rgba(26,15,11,0.06)', color: 'var(--ink)',
                borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
              }}>cancel</button>
            </div>
          </div>
        ) : (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={save} disabled={busy} style={{
            flex: 1, padding: '14px', background: busy ? 'rgba(26,15,11,0.4)' : 'var(--ink)',
            color: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
          }}>
            {busy ? 'saving…' : 'save category'}
          </button>
          {!isNew && (
            <button onClick={() => setConfirmDel(true)} disabled={busy} style={{
              padding: '14px 16px', background: 'rgba(255,48,48,0.08)', color: 'var(--red)',
              borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
            }}>
              delete
            </button>
          )}
        </div>
        )}
      </div>
    </Sheet>
  );
};

// ─── ITEMS TAB ────────────────────────────────────────────────────────────────
const ItemsTab = ({ passcode, onSave }) => {
  const data = window.CRUMBS_DATA;
  const [filterCat, setFilterCat] = useAS('all');
  const [editing, setEditing] = useAS(null);

  const items = filterCat === 'all' ? data.items : data.items.filter(i => i.cat === filterCat);

  const catLabel = (id) => data.categories.find(c => c.id === id)?.label || id;

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Category filter */}
      <div className="no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 16px 0' }}>
        <button onClick={() => setFilterCat('all')} style={chipStyle(filterCat === 'all')}>all</button>
        {data.categories.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} style={chipStyle(filterCat === c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Item list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(it => (
          <button key={it.id} onClick={() => setEditing(it)} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', background: '#fff', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)', textAlign: 'left', width: '100%',
            boxShadow: '0 1px 0 rgba(26,15,11,0.04)',
          }}>
            <ProductMark id={it.id} size={44}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 16, lineHeight: 1.2 }}>{it.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                {catLabel(it.cat)} · {it.variants.map(v => `₹${v.price}`).join(' / ')}
                {it.tag && <span style={{ color: 'var(--red)', marginLeft: 6 }}>✦ {it.tag}</span>}
              </div>
            </div>
            <Icon name="arrow-right" size={16} stroke={1.5}/>
          </button>
        ))}
      </div>

      {/* Add new item FAB */}
      <button onClick={() => setEditing({ _new: true, cat: filterCat !== 'all' ? filterCat : data.categories[0]?.id })} style={{
        position: 'fixed', right: 'max(16px, calc((100vw - 430px) / 2 + 16px))', bottom: 24,
        padding: '12px 20px', background: 'var(--red)', color: 'var(--cream)',
        borderRadius: 999, fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px -8px rgba(255,48,48,0.5)',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 10,
      }}>
        <Icon name="plus" size={16}/> new item
      </button>

      <ItemEditSheet
        open={!!editing}
        item={editing}
        cats={data.categories}
        passcode={passcode}
        onClose={() => setEditing(null)}
        onSave={() => { setEditing(null); onSave(); }}
        onDelete={() => { setEditing(null); onSave(); }}
      />
    </div>
  );
};

// ─── CATEGORIES TAB ───────────────────────────────────────────────────────────
const CategoriesTab = ({ passcode, onSave }) => {
  const data = window.CRUMBS_DATA;
  const [editing, setEditing] = useAS(null);

  return (
    <div style={{ padding: '14px 16px 100px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.categories.map(c => {
        const count = data.items.filter(i => i.cat === c.id).length;
        return (
          <button key={c.id} onClick={() => setEditing(c)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px', background: '#fff', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)', textAlign: 'left', width: '100%',
            boxShadow: '0 1px 0 rgba(26,15,11,0.04)',
          }}>
            <div>
              <div className="serif" style={{ fontSize: 18, lineHeight: 1.2 }}>{c.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                {count} {count === 1 ? 'item' : 'items'}
              </div>
            </div>
            <Icon name="arrow-right" size={16} stroke={1.5}/>
          </button>
        );
      })}

      <button onClick={() => setEditing({ _new: true })} style={{
        position: 'fixed', right: 'max(16px, calc((100vw - 430px) / 2 + 16px))', bottom: 24,
        padding: '12px 20px', background: 'var(--ink)', color: 'var(--cream)',
        borderRadius: 999, fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px -8px rgba(26,15,11,0.35)',
        display: 'flex', alignItems: 'center', gap: 8, zIndex: 10,
      }}>
        <Icon name="plus" size={16}/> new category
      </button>

      <CatEditSheet
        open={!!editing}
        cat={editing}
        passcode={passcode}
        existingCount={data.categories.length}
        onClose={() => setEditing(null)}
        onSave={() => { setEditing(null); onSave(); }}
        onDelete={() => { setEditing(null); onSave(); }}
      />
    </div>
  );
};

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
const SettingsTab = ({ passcode, openToast }) => {
  const brand = window.CRUMBS_DATA.brand;
  const [form, setForm] = useAS({ location: brand.location, tagline: brand.tagline, rating: brand.rating, reviews: brand.reviews });
  const [pcForm, setPcForm] = useAS({ newPc: '', confirmPc: '' });
  const [busy, setBusy] = useAS(false);
  const [pcBusy, setPcBusy] = useAS(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveBrand = async () => {
    setBusy(true);
    try {
      await adminCall('crumbs_hyd_update_config', {
        p_passcode: passcode,
        p_location: form.location,
        p_tagline: form.tagline,
        p_rating: Number(form.rating),
        p_reviews: Number(form.reviews),
      });
      window.CRUMBS_DATA.brand = { ...brand, ...form };
      openToast('settings saved');
    } catch (e) { openToast('error: ' + (e.message || 'save failed')); }
    setBusy(false);
  };

  const changePasscode = async () => {
    if (!pcForm.newPc.trim()) return;
    if (pcForm.newPc !== pcForm.confirmPc) { openToast('passcodes don\'t match'); return; }
    if (pcForm.newPc.length < 8) { openToast('passcode too short (min 8 chars)'); return; }
    setPcBusy(true);
    try {
      await adminCall('crumbs_hyd_change_passcode', { p_old_passcode: passcode, p_new_passcode: pcForm.newPc.trim() });
      localStorage.setItem('crumbs-admin-pc', pcForm.newPc.trim());
      setPcForm({ newPc: '', confirmPc: '' });
      openToast('passcode changed — save it somewhere safe!');
    } catch (e) { openToast('error: ' + (e.message || 'change failed')); }
    setPcBusy(false);
  };

  return (
    <div style={{ padding: '20px 16px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '18px 18px 20px', border: '1px solid var(--line)' }}>
        <div className="serif" style={{ fontSize: 20, marginBottom: 16 }}>brand info</div>
        <AField label="pickup location">
          <input value={form.location} onChange={e => set('location', e.target.value)} style={aFieldStyle}/>
        </AField>
        <AField label="tagline">
          <input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={aFieldStyle}/>
        </AField>
        <div style={{ display: 'flex', gap: 10 }}>
          <AField label="rating" style={{ flex: 1 }}>
            <input type="number" value={form.rating} onChange={e => set('rating', e.target.value)} step="0.1" min="0" max="5" style={aFieldStyle}/>
          </AField>
          <AField label="order count" style={{ flex: 1 }}>
            <input type="number" value={form.reviews} onChange={e => set('reviews', e.target.value)} min="0" style={aFieldStyle}/>
          </AField>
        </div>
        <button onClick={saveBrand} disabled={busy} style={{
          width: '100%', padding: '13px', background: busy ? 'rgba(26,15,11,0.3)' : 'var(--ink)',
          color: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
        }}>
          {busy ? 'saving…' : 'save brand info'}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '18px 18px 20px', border: '1px solid var(--line)' }}>
        <div className="serif" style={{ fontSize: 20, marginBottom: 4 }}>change passcode</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 16 }}>current passcode: <span className="mono" style={{ background: 'rgba(26,15,11,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{passcode}</span></div>
        <AField label="new passcode">
          <input type="password" value={pcForm.newPc} onChange={e => setPcForm(f => ({ ...f, newPc: e.target.value }))} placeholder="min 8 characters" style={aFieldStyle}/>
        </AField>
        <AField label="confirm new passcode">
          <input type="password" value={pcForm.confirmPc} onChange={e => setPcForm(f => ({ ...f, confirmPc: e.target.value }))} style={aFieldStyle}/>
        </AField>
        <button onClick={changePasscode} disabled={pcBusy || !pcForm.newPc} style={{
          width: '100%', padding: '13px', background: (!pcForm.newPc || pcBusy) ? 'rgba(255,48,48,0.2)' : 'var(--red)',
          color: 'var(--cream)', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600,
        }}>
          {pcBusy ? 'changing…' : 'change passcode'}
        </button>
      </div>
    </div>
  );
};

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
const AdminPanel = ({ passcode, go, reload, openToast, onLogout }) => {
  const [tab, setTab] = useAS('items');
  const [key, setKey] = useAS(0); // bump to re-render after save

  const onSave = async () => {
    await reload();
    setKey(k => k + 1);
    openToast('saved & menu updated');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: 'var(--ink)', color: 'var(--cream)',
        padding: '14px 16px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="serif" style={{ fontSize: 20, lineHeight: 1 }}>Crumbs admin</div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>kitchen secrets panel</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => go('menu')} style={{
              padding: '7px 12px', background: 'rgba(253,248,232,0.1)', color: 'var(--cream)',
              borderRadius: 8, fontSize: 12, border: '1px solid rgba(253,248,232,0.15)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icon name="arrow-right" size={12}/> view menu
            </button>
            <button onClick={onLogout} style={{
              padding: '7px 12px', background: 'rgba(255,48,48,0.15)', color: '#FF8888',
              borderRadius: 8, fontSize: 12, border: '1px solid rgba(255,48,48,0.2)',
            }}>
              logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(253,248,232,0.1)' }}>
          {[['items', 'Items'], ['categories', 'Categories'], ['settings', 'Settings']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              flex: 1, padding: '12px 4px', fontSize: 13, fontWeight: 600,
              color: tab === id ? 'var(--cream)' : 'rgba(253,248,232,0.45)',
              borderBottom: tab === id ? '2px solid var(--red)' : '2px solid transparent',
              transition: 'color 0.15s',
            }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div key={key}>
        {tab === 'items' && <ItemsTab passcode={passcode} onSave={onSave}/>}
        {tab === 'categories' && <CategoriesTab passcode={passcode} onSave={onSave}/>}
        {tab === 'settings' && <SettingsTab passcode={passcode} openToast={openToast}/>}
      </div>
    </div>
  );
};

// ─── ADMIN ROOT ───────────────────────────────────────────────────────────────
const Admin = ({ go, reload, openToast }) => {
  const [step, setStep] = useAS(() => {
    const saved = localStorage.getItem('crumbs-admin-pc');
    return saved ? 'panel' : 'gate';
  });
  const [passcode, setPasscode] = useAS(() => localStorage.getItem('crumbs-admin-pc') || '');

  const onEnter = (pc) => { setPasscode(pc); setStep('panel'); };
  const onLogout = () => { localStorage.removeItem('crumbs-admin-pc'); setPasscode(''); setStep('gate'); };

  if (step === 'gate') return <AdminGate onEnter={onEnter}/>;
  return <AdminPanel passcode={passcode} go={go} reload={reload} openToast={openToast} onLogout={onLogout}/>;
};

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────
const AField = ({ label, children, style }) => (
  <label style={{ display: 'block', marginBottom: 14, ...style }}>
    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-3)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
    {children}
  </label>
);

const aFieldStyle = {
  width: '100%', padding: '11px 13px',
  background: 'transparent', border: '1px solid var(--line)',
  borderRadius: 'var(--radius-md)', fontFamily: 'inherit',
  fontSize: 14, lineHeight: 1.4, color: 'var(--ink)',
  outline: 'none', resize: 'vertical',
  boxSizing: 'border-box',
};

const chipStyle = (active) => ({
  padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap',
  background: active ? 'var(--ink)' : 'transparent',
  color: active ? 'var(--cream)' : 'var(--ink-2)',
  border: '1px solid ' + (active ? 'var(--ink)' : 'var(--line)'),
  fontSize: 13, fontWeight: 500, flexShrink: 0,
});

window.Admin = Admin;
