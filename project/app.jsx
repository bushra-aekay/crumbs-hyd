/** Crumbs — root app */
const { useState, useReducer, useEffect } = React;

const cartReducer = (state, a) => {
  switch (a.t) {
    case 'add': {
      // Items with toppings get their own line (toppings = unique signature)
      const sig = (a.toppings || []).slice().sort().join(',');
      const ex = state.find(l => l.id === a.id && l.vi === a.vi && (l.sig || '') === sig);
      if (ex) return state.map(l => l === ex ? { ...l, qty: l.qty + 1 } : l);
      return [...state, { id: a.id, vi: a.vi, qty: 1, toppings: a.toppings || [], sig }];
    }
    case 'inc': return state.map(l => l.id === a.id && l.vi === a.vi && (a.sig === undefined || l.sig === a.sig) ? { ...l, qty: l.qty + 1 } : l);
    case 'dec': return state.flatMap(l => {
      if (l.id !== a.id || l.vi !== a.vi || (a.sig !== undefined && l.sig !== a.sig)) return [l];
      const q = l.qty - 1;
      return q <= 0 ? [] : [{ ...l, qty: q }];
    });
    case 'clear': return [];
    default: return state;
  }
};

const App = () => {
  const [route, go] = useRoute();
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try { return JSON.parse(localStorage.getItem('crumbs-cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('crumbs-cart', JSON.stringify(cart)); }, [cart]);

  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('crumbs-favs') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('crumbs-favs', JSON.stringify(favs)); }, [favs]);
  const toggleFav = (id) => setFavs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [toast, setToast] = useState({ msg: '', show: false });
  const openToast = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  };

  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);

  // Apply accent color live
  useEffect(() => {
    document.documentElement.style.setProperty('--red', tweaks.accent);
  }, [tweaks.accent]);

  return (
    <div className="crumbs-app">
      {route === 'menu' ? (
        <Menu go={go} tweaks={tweaks} cart={cart} dispatch={dispatch}
          favs={favs} toggleFav={toggleFav}
          openCart={() => setCartOpen(true)} openToast={openToast}/>
      ) : (
        <Home go={go}/>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
        cart={cart} dispatch={dispatch}
        onCheckout={() => { setCartOpen(false); setTimeout(() => setCheckoutOpen(true), 200); }}/>

      <CheckoutSheet open={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        cart={cart} openToast={openToast}/>

      <Toast msg={toast.msg} show={toast.show}/>

      <CrumbsTweaks tweaks={tweaks} setTweak={setTweak}/>
    </div>
  );
};

const CrumbsTweaks = ({ tweaks, setTweak }) => (
  <TweaksPanel title="Tweaks">
    <TweakSection title="Header">
      <TweakRadio label="Hero style" value={tweaks.headerStyle}
        options={[{value:'photo',label:'Atmospheric'},{value:'flat',label:'Flat'}]}
        onChange={v => setTweak('headerStyle', v)}/>
    </TweakSection>
    <TweakSection title="Menu items">
      <TweakRadio label="Layout" value={tweaks.itemLayout}
        options={[{value:'card',label:'Cards'},{value:'rule',label:'Editorial'}]}
        onChange={v => setTweak('itemLayout', v)}/>
      <TweakToggle label="Show artwork"
        value={tweaks.showMarks} onChange={v => setTweak('showMarks', v)}/>
      <TweakRadio label="Add button" value={tweaks.ctaStyle}
        options={[{value:'pill',label:'Stamp pill'},{value:'square',label:'Filled'}]}
        onChange={v => setTweak('ctaStyle', v)}/>
    </TweakSection>
    <TweakSection title="Color">
      <TweakColor label="Accent" value={tweaks.accent}
        options={['#FF3030','#E11A1A','#D14242','#C2410C','#1F8A5B']}
        onChange={v => setTweak('accent', v)}/>
    </TweakSection>
  </TweaksPanel>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
