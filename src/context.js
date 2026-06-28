import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEMO_USERS, DEMO_PROVIDERS, PROVIDERS, DEMO_BOOKINGS } from './data';

// ── Auth Context ───────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

// ── Toast Context ──────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

// ── In-memory store ────────────────────────────────────────────────────────
let _users     = [...DEMO_USERS];
let _providers = [...PROVIDERS];
let _bookings  = [...DEMO_BOOKINGS];

export { _providers as liveProviders, _bookings as liveBookings };

export function AppProvider({ children }) {
  const [user,     setUser]     = useState(null);   // logged-in user object
  const [provider, setProvider] = useState(null);   // provider row if role=provider
  const [toasts,   setToasts]   = useState([]);
  const [bookings, setBookings] = useState(_bookings);
  const [providers, setProviders] = useState(_providers);

  // ── Toast ──────────────────────────────────────────────────────────────
  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // ── Auth ───────────────────────────────────────────────────────────────
  const login = (email, password) => {
    // Check demo users
    const u = _users.find(x => x.email === email && x.password === password);
    if (u) { setUser(u); setProvider(null); return u; }
    // Check demo providers
    const dp = DEMO_PROVIDERS.find(x => x.email === email && x.password === password);
    if (dp) {
      setUser(dp);
      const prov = _providers.find(p => p.id === dp.providerId);
      setProvider(prov || null);
      return dp;
    }
    throw new Error('Invalid email or password');
  };

  const register = (fields, isProvider = false) => {
    if (_users.find(u => u.email === fields.email) || DEMO_PROVIDERS.find(u => u.email === fields.email)) {
      throw new Error('Email already registered');
    }
    const id = 'u' + Date.now();
    if (isProvider) {
      const provId = 'p' + Date.now();
      const initials = fields.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const newProv = {
        id: provId, name: fields.name, title: fields.title || fields.category + ' Professional',
        category: fields.category, bio: fields.bio || '', experience: parseInt(fields.experience) || 1,
        rating: 0, reviews: 0, jobs: 0, available: false, verified: false, plan: 'basic', surge: false,
        area: 'Lucknow', avatar: initials, color: { bg: '#EFF6FF', fg: '#1D4ED8' },
        phone: fields.phone || '', services: [],
        earnings: { today: 0, week: 0, month: 0 }, weeklyEarnings: [0,0,0,0,0,0,0],
        docs: { aadhaar: 'pending', license: 'pending', background: 'pending' },
      };
      _providers = [..._providers, newProv];
      setProviders([..._providers]);
      const newUser = { id, name: fields.name, email: fields.email, password: fields.password, role: 'provider', providerId: provId, phone: fields.phone || '' };
      _users = [..._users, newUser];
      setUser(newUser);
      setProvider(newProv);
      return newUser;
    } else {
      const newUser = { id, name: fields.name, email: fields.email, password: fields.password, role: 'customer', phone: fields.phone || '', address: '' };
      _users = [..._users, newUser];
      setUser(newUser);
      setProvider(null);
      return newUser;
    }
  };

  const logout = () => { setUser(null); setProvider(null); };

  // ── Bookings ───────────────────────────────────────────────────────────
  const createBooking = (data) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const bk = {
      id: 'bk' + Date.now(),
      ref: 'SE-' + Date.now().toString().slice(-5),
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      customerId: user?.id,
      ...data,
      status: 'confirmed',
      paymentStatus: data.paymentType === 'deposit' ? 'deposit_paid' : 'paid',
      review: null,
      timeline: [
        { status: 'confirmed', time: now, note: 'Booking confirmed & payment received' },
      ],
    };
    _bookings = [bk, ..._bookings];
    setBookings([..._bookings]);
    return bk;
  };

  const updateBookingStatus = (id, status, note) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const statusNotes = {
      accepted: 'Provider accepted your booking',
      en_route: 'Provider is on the way',
      arrived: 'Provider has arrived',
      in_progress: 'Service in progress',
      completed: 'Service completed successfully',
      cancelled: 'Booking cancelled',
    };
    _bookings = _bookings.map(b => b.id === id ? {
      ...b, status,
      paymentStatus: status === 'completed' ? 'paid' : b.paymentStatus,
      timeline: [...(b.timeline || []), { status, time: now, note: note || statusNotes[status] || status }],
    } : b);
    setBookings([..._bookings]);
  };

  const submitReview = (bookingId, rating, text, tip) => {
    _bookings = _bookings.map(b => b.id === bookingId ? { ...b, review: { rating, text, tip } } : b);
    setBookings([..._bookings]);
    // Update provider rating
    const bk = _bookings.find(b => b.id === bookingId);
    if (bk) {
      const provBookings = _bookings.filter(b => b.providerId === bk.providerId && b.review);
      const avg = provBookings.reduce((s, b) => s + b.review.rating, 0) / provBookings.length;
      _providers = _providers.map(p => p.id === bk.providerId ? { ...p, rating: Math.round(avg * 10) / 10, reviews: provBookings.length } : p);
      setProviders([..._providers]);
    }
  };

  const updateProviderAvailability = (providerId, val) => {
    _providers = _providers.map(p => p.id === providerId ? { ...p, available: val } : p);
    setProviders([..._providers]);
    if (provider?.id === providerId) setProvider(p => ({ ...p, available: val }));
  };

  const updateProviderPlan = (providerId, plan) => {
    _providers = _providers.map(p => p.id === providerId ? { ...p, plan } : p);
    setProviders([..._providers]);
    if (provider?.id === providerId) setProvider(p => ({ ...p, plan }));
  };

  const updateProviderProfile = (providerId, updates) => {
    _providers = _providers.map(p => p.id === providerId ? { ...p, ...updates } : p);
    setProviders([..._providers]);
    if (provider?.id === providerId) setProvider(p => ({ ...p, ...updates }));
  };

  const myBookings = bookings.filter(b =>
    user?.role === 'provider'
      ? b.providerId === provider?.id
      : b.customerId === user?.id
  );

  return (
    <AuthCtx.Provider value={{ user, provider, login, register, logout, isProvider: user?.role === 'provider' }}>
      <ToastCtx.Provider value={toast}>
        {children}

        {/* Toasts */}
        <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
          {toasts.map(t => (
            <div key={t.id} style={{
              background: t.type==='success'?'#16A34A':t.type==='error'?'#DC2626':t.type==='warning'?'#D97706':'#1E293B',
              color:'#fff', padding:'11px 16px', borderRadius:10,
              fontSize:13, fontWeight:500, maxWidth:300, boxShadow:'0 4px 16px rgba(0,0,0,.2)',
              display:'flex', alignItems:'center', gap:8,
              animation:'fadeUp .25s ease',
            }}>
              {t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'} {t.message}
            </div>
          ))}
        </div>

        <style>{`@keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>

        {/* Expose helpers via context hack */}
        <BookingCtxProvider value={{ bookings, myBookings, createBooking, updateBookingStatus, submitReview, providers, updateProviderAvailability, updateProviderPlan, updateProviderProfile }}>
          {null}
        </BookingCtxProvider>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}

// Booking/data context
const BookingCtx = createContext(null);
export const useStore = () => useContext(BookingCtx);
function BookingCtxProvider({ value, children }) {
  return <BookingCtx.Provider value={value}>{children}</BookingCtx.Provider>;
}

// Combined provider
export function Providers({ children }) {
  return <_InnerProvider>{children}</_InnerProvider>;
}

function _InnerProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [provider, setProvider] = useState(null);
  const [toasts, setToasts]     = useState([]);
  const [bookings, setBookings] = useState([..._bookings]);
  const [providers, setProviders] = useState([..._providers]);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  const login = (email, password) => {
    const u = _users.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (u) { setUser(u); setProvider(null); return u; }
    const dp = DEMO_PROVIDERS.find(x => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (dp) {
      setUser(dp);
      const prov = _providers.find(p => p.id === dp.providerId);
      setProvider(prov || null);
      return dp;
    }
    throw new Error('Invalid email or password');
  };

  const register = (fields, isProvider = false) => {
    const exists = [..._users, ...DEMO_PROVIDERS].find(u => u.email.toLowerCase() === fields.email.toLowerCase());
    if (exists) throw new Error('Email already registered');
    const id = 'u' + Date.now();
    if (isProvider) {
      const provId = 'p' + Date.now();
      const initials = (fields.name || 'NP').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const newProv = {
        id: provId, name: fields.name, title: fields.title || fields.category + ' Professional',
        category: fields.category || 'Electrical', bio: fields.bio || '',
        experience: parseInt(fields.experience) || 1,
        rating: 0, reviews: 0, jobs: 0, available: false, verified: false, plan: 'basic', surge: false,
        area: 'Lucknow', avatar: initials, color: { bg: '#EFF6FF', fg: '#1D4ED8' },
        phone: fields.phone || '', services: [],
        earnings: { today: 0, week: 0, month: 0 }, weeklyEarnings: [0,0,0,0,0,0,0],
        docs: { aadhaar: 'pending', license: 'pending', background: 'pending' },
      };
      _providers = [..._providers, newProv];
      setProviders([..._providers]);
      const newUser = { id, name: fields.name, email: fields.email, password: fields.password, role: 'provider', providerId: provId, phone: fields.phone || '' };
      _users = [..._users, newUser];
      setUser(newUser); setProvider(newProv);
      return newUser;
    } else {
      const newUser = { id, name: fields.name, email: fields.email, password: fields.password, role: 'customer', phone: fields.phone || '', address: '' };
      _users = [..._users, newUser];
      setUser(newUser); setProvider(null);
      return newUser;
    }
  };

  const logout = () => { setUser(null); setProvider(null); };

  const createBooking = (data) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const bk = {
      id: 'bk' + Date.now(),
      ref: 'SE-' + Date.now().toString().slice(-5),
      invoiceNo: 'INV-2026-' + Math.floor(1000 + Math.random() * 9000),
      customerId: user?.id, ...data, status: 'confirmed',
      paymentStatus: data.paymentType === 'deposit' ? 'deposit_paid' : 'paid',
      review: null,
      timeline: [{ status: 'confirmed', time: now, note: 'Booking confirmed & payment received' }],
    };
    _bookings = [bk, ..._bookings];
    setBookings([..._bookings]);
    return bk;
  };

  const updateBookingStatus = (id, status) => {
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const notes = { accepted:'Provider accepted',en_route:'Provider en route',arrived:'Provider arrived',in_progress:'Service in progress',completed:'Service completed',cancelled:'Booking cancelled' };
    _bookings = _bookings.map(b => b.id === id ? { ...b, status, paymentStatus: status==='completed'?'paid':b.paymentStatus, timeline:[...(b.timeline||[]),{status,time:now,note:notes[status]||status}] } : b);
    setBookings([..._bookings]);
  };

  const submitReview = (bookingId, rating, text, tip) => {
    _bookings = _bookings.map(b => b.id === bookingId ? { ...b, review:{rating,text,tip} } : b);
    setBookings([..._bookings]);
    const bk = _bookings.find(b => b.id === bookingId);
    if (bk) {
      const provBks = _bookings.filter(b => b.providerId===bk.providerId && b.review);
      const avg = provBks.reduce((s,b)=>s+b.review.rating,0)/provBks.length;
      _providers = _providers.map(p => p.id===bk.providerId ? {...p,rating:Math.round(avg*10)/10,reviews:provBks.length} : p);
      setProviders([..._providers]);
    }
  };

  const updateProviderAvailability = (pid, val) => {
    _providers = _providers.map(p => p.id===pid?{...p,available:val}:p);
    setProviders([..._providers]);
    if (provider?.id===pid) setProvider(p=>({...p,available:val}));
  };

  const updateProviderPlan = (pid, plan) => {
    _providers = _providers.map(p => p.id===pid?{...p,plan}:p);
    setProviders([..._providers]);
    if (provider?.id===pid) setProvider(p=>({...p,plan}));
  };

  const updateProviderProfile = (pid, updates) => {
    _providers = _providers.map(p => p.id===pid?{...p,...updates}:p);
    setProviders([..._providers]);
    if (provider?.id===pid) setProvider(p=>({...p,...updates}));
  };

  const myBookings = bookings.filter(b => user?.role==='provider' ? b.providerId===provider?.id : b.customerId===user?.id);

  const authVal  = { user, provider, login, register, logout, isProvider: user?.role==='provider' };
  const storeVal = { bookings, myBookings, providers, createBooking, updateBookingStatus, submitReview, updateProviderAvailability, updateProviderPlan, updateProviderProfile };

  return (
    <AuthCtx.Provider value={authVal}>
      <ToastCtx.Provider value={toast}>
        <BookingCtx.Provider value={storeVal}>
          {children}
        </BookingCtx.Provider>
        <div style={{position:'fixed',bottom:20,right:20,zIndex:9999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
          {toasts.map(t=>(
            <div key={t.id} style={{background:t.type==='success'?'#16A34A':t.type==='error'?'#DC2626':t.type==='warning'?'#D97706':'#1E293B',color:'#fff',padding:'11px 16px',borderRadius:10,fontSize:13,fontWeight:500,maxWidth:300,boxShadow:'0 4px 16px rgba(0,0,0,.2)',display:'flex',alignItems:'center',gap:8,animation:'fadeUp .25s ease'}}>
              {t.type==='success'?'✓':t.type==='error'?'✕':'ℹ'} {t.message}
            </div>
          ))}
        </div>
        <style>{`@keyframes fadeUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      </ToastCtx.Provider>
    </AuthCtx.Provider>
  );
}
