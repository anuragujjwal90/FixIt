import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context';
import { useToast } from '../context';
import { calcPricing } from '../data';

const STEPS = ['Service', 'Schedule', 'Address', 'Payment', 'Confirm'];
const SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
const BUSY  = ['10:00 AM', '3:00 PM'];

export default function BookingPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { createBooking } = useStore();
  const toast = useToast();

  const provider = state?.provider;

  const [step,        setStep]        = useState(1);
  const [selSvcs,     setSelSvcs]     = useState([]);
  const [slot,        setSlot]        = useState('');
  const [date,        setDate]        = useState(new Date().toISOString().split('T')[0]);
  const [bookType,    setBookType]    = useState('one-time');
  const [address,     setAddress]     = useState('');
  const [landmark,    setLandmark]    = useState('');
  const [notes,       setNotes]       = useState('');
  const [payType,     setPayType]     = useState('full');
  const [payMethod,   setPayMethod]   = useState('card');
  const [cardNum,     setCardNum]     = useState('');
  const [cardExp,     setCardExp]     = useState('');
  const [cardCvv,     setCardCvv]     = useState('');
  const [cardName,    setCardName]    = useState('');
  const [booking,     setBooking]     = useState(null);
  const [loading,     setLoading]     = useState(false);

  if (!provider) {
    return (
      <div className="page-sm tc" style={{ paddingTop:60 }}>
        <div style={{ fontSize:40, marginBottom:12 }}>😕</div>
        <p className="muted mb3">No provider selected.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Providers</button>
      </div>
    );
  }

  const pricing = calcPricing(selSvcs, provider.surge);
  const discount = bookType === 'weekly' ? Math.round(pricing.subtotal * 0.15) : bookType === 'monthly' ? Math.round(pricing.subtotal * 0.25) : 0;
  const finalTotal   = pricing.total - discount;
  const finalDeposit = Math.round(finalTotal * 0.3);

  const toggleSvc = (svc) => {
    setSelSvcs(prev => prev.find(s => s.id === svc.id) ? prev.filter(s => s.id !== svc.id) : [...prev, svc]);
  };

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      const bk = createBooking({
        providerId:   provider.id,
        providerName: provider.name,
        category:     provider.category,
        services:     selSvcs,
        date, time: slot, address, landmark, notes,
        paymentType:   payType,
        paymentMethod: payMethod,
        subtotal:  pricing.subtotal,
        surgeFee:  pricing.surgeFee,
        convFee:   pricing.convFee,
        gst:       pricing.gst,
        total:     finalTotal,
        deposit:   finalDeposit,
      });
      setBooking(bk);
      setStep(5);
      setLoading(false);
      toast('Booking confirmed! 🎉', 'success');
    }, 800);
  };

  const canNext = step === 1 ? selSvcs.length > 0 : step === 2 ? !!slot : step === 3 ? address.trim().length > 0 : true;

  const next = () => {
    if (step === 1 && selSvcs.length === 0) { toast('Select at least one service', 'warning'); return; }
    if (step === 2 && !slot)                { toast('Pick a time slot', 'warning'); return; }
    if (step === 3 && !address.trim())      { toast('Enter your address', 'warning'); return; }
    if (step === 4) { handleConfirm(); return; }
    setStep(s => s + 1);
  };

  return (
    <div className="page-sm">
      <button className="btn btn-ghost btn-sm mb3" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/')}>← Back</button>

      {/* Steps indicator */}
      <div className="steps">
        {STEPS.map((label, i) => {
          const n = i + 1;
          return (
            <div key={label} className="step">
              <div className={`step-c${n < step ? ' done' : n === step ? ' active' : ''}`}>
                {n < step ? '✓' : n}
              </div>
              <div className={`step-l${n === step ? ' active' : ''}`}>{label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Services ── */}
      {step === 1 && (
        <div className="card">
          <div className="flex gap3 aic mb3">
            <div className="ava" style={{ width:46,height:46,fontSize:14,background:provider.color.bg,color:provider.color.fg }}>{provider.avatar}</div>
            <div>
              <div className="bold">{provider.name}</div>
              <div className="xs muted">{provider.title}</div>
            </div>
            {provider.surge && <span className="badge badge-amber" style={{ marginLeft:'auto' }}>⚡ Surge</span>}
          </div>

          {provider.surge && (
            <div className="surge mb3">⚠️ High demand — 20% surge pricing applied.</div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {(provider.services || []).map(svc => {
              const sel = selSvcs.find(s => s.id === svc.id);
              return (
                <div
                  key={svc.id}
                  onClick={() => toggleSvc(svc)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 13px',
                    border:`1px solid ${sel ? 'var(--blue)' : 'var(--border)'}`,
                    borderRadius:'var(--r)', cursor:'pointer',
                    background: sel ? 'var(--blue-lt)' : 'var(--white)', transition:'all .15s',
                  }}
                >
                  <div style={{ width:17,height:17,borderRadius:4,border:`2px solid ${sel?'var(--blue)':'var(--border)'}`,background:sel?'var(--blue)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10,flexShrink:0 }}>
                    {sel && '✓'}
                  </div>
                  <span style={{ flex:1, fontSize:13, fontWeight: sel ? 600 : 400 }}>{svc.name}</span>
                  <span style={{ fontWeight:700, color:'var(--blue)', fontSize:13 }}>₹{svc.price}</span>
                  <span className="xs muted">{svc.duration}m</span>
                </div>
              );
            })}
          </div>

          <div className="field">
            <label className="label">Booking Type</label>
            <select className="input" value={bookType} onChange={e => setBookType(e.target.value)}>
              <option value="one-time">One-time visit</option>
              <option value="weekly">Weekly subscription (Save 15%)</option>
              <option value="monthly">Monthly subscription (Save 25%)</option>
            </select>
          </div>

          {selSvcs.length > 0 && (
            <div style={{ background:'var(--surface)', borderRadius:'var(--r)', padding:14 }}>
              {selSvcs.map(s => (
                <div key={s.id} className="flex jsb" style={{ fontSize:13, marginBottom:5, color:'var(--ink2)' }}>
                  <span>{s.name}</span><span>₹{s.price}</span>
                </div>
              ))}
              {pricing.surgeFee > 0 && <div className="flex jsb" style={{ fontSize:13, marginBottom:5, color:'var(--amber)' }}><span>⚡ Surge (20%)</span><span>+₹{pricing.surgeFee}</span></div>}
              {discount > 0        && <div className="flex jsb" style={{ fontSize:13, marginBottom:5, color:'var(--green)' }}><span>Subscription discount</span><span>−₹{discount}</span></div>}
              <div className="flex jsb" style={{ fontSize:12, marginBottom:5, color:'var(--ink3)' }}><span>Convenience fee</span><span>₹{pricing.convFee}</span></div>
              <div className="flex jsb" style={{ fontSize:12, marginBottom:5, color:'var(--ink3)' }}><span>GST (18%)</span><span>₹{pricing.gst}</span></div>
              <div className="divider" style={{ margin:'8px 0' }} />
              <div className="flex jsb bold" style={{ fontSize:16 }}><span>Total</span><span style={{ color:'var(--blue)' }}>₹{finalTotal}</span></div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Schedule ── */}
      {step === 2 && (
        <div className="card">
          <div className="bold mb3">📅 Schedule</div>
          <div className="field">
            <label className="label">Date</label>
            <input className="input" type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Available Time Slots</label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
              {SLOTS.map(s => {
                const busy = BUSY.includes(s);
                const sel  = slot === s;
                return (
                  <div
                    key={s}
                    onClick={() => !busy && setSlot(s)}
                    style={{
                      padding:'9px 6px', textAlign:'center', borderRadius:'var(--r)',
                      border:`1px solid ${sel?'var(--blue)':busy?'var(--border)':'var(--border)'}`,
                      background: sel?'var(--blue)':busy?'var(--surface)':'var(--white)',
                      color: sel?'#fff':busy?'var(--ink4)':'var(--ink)',
                      cursor: busy?'not-allowed':'pointer', fontSize:12,
                      fontWeight: sel ? 600 : 400, transition:'all .15s',
                    }}
                  >
                    {s}
                    {busy && <div style={{ fontSize:9, marginTop:2 }}>Booked</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Address ── */}
      {step === 3 && (
        <div className="card">
          <div className="bold mb3">📍 Service Address</div>
          <div className="field">
            <label className="label">Full Address</label>
            <textarea className="input" rows={3} placeholder="House No., Street, Colony…" value={address} onChange={e => setAddress(e.target.value)} style={{ resize:'vertical' }} />
          </div>
          <div className="g2">
            <div className="field"><label className="label">City</label><input className="input" defaultValue="Lucknow" readOnly /></div>
            <div className="field"><label className="label">PIN Code</label><input className="input" placeholder="226010" /></div>
          </div>
          <div className="field">
            <label className="label">Landmark (optional)</label>
            <input className="input" placeholder="Near Metro / Mall" value={landmark} onChange={e => setLandmark(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Special Instructions</label>
            <textarea className="input" rows={2} placeholder="Gate code, floor, parking notes…" value={notes} onChange={e => setNotes(e.target.value)} style={{ resize:'vertical' }} />
          </div>
          <div style={{ background:'var(--blue-lt)',borderRadius:'var(--r)',padding:11,display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:18 }}>📡</span>
            <div style={{ flex:1 }}>
              <div className="bold sm">Detect my location</div>
              <div className="xs muted">Use GPS for precise address</div>
            </div>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => { setAddress('12, Gomti Nagar, Lucknow'); toast('Location detected', 'success'); }}>Use GPS</button>
          </div>
        </div>
      )}

      {/* ── Step 4: Payment ── */}
      {step === 4 && (
        <div className="card">
          <div className="bold mb3">💳 Payment</div>
          <div style={{ background:'var(--green-lt)',border:'1px solid #86EFAC',borderRadius:'var(--r)',padding:11,fontSize:12,color:'var(--green)',marginBottom:14 }}>
            💡 <strong>Split payment:</strong> Pay ₹{finalDeposit} deposit now and ₹{finalTotal - finalDeposit} on completion.
          </div>

          {/* Pay type tabs */}
          <div style={{ display:'flex',border:'1px solid var(--border)',borderRadius:'var(--r)',overflow:'hidden',marginBottom:16 }}>
            {[['full',`Full ₹${finalTotal}`],['deposit',`Deposit ₹${finalDeposit}`]].map(([t,l]) => (
              <button
                key={t} type="button"
                onClick={() => setPayType(t)}
                style={{ flex:1,padding:'9px 6px',border:'none',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'var(--font)',transition:'all .15s',background:payType===t?'var(--blue)':'var(--white)',color:payType===t?'#fff':'var(--ink3)' }}
              >{l}</button>
            ))}
          </div>

          {/* Method */}
          <div className="field">
            <label className="label">Payment Method</label>
            <div className="flex gap2 fw mb3">
              {[['card','💳 Card'],['upi','📱 UPI'],['netbanking','🏦 Net Banking'],['wallet','👛 Wallet']].map(([m,l]) => (
                <button key={m} type="button" onClick={() => setPayMethod(m)} style={{ flex:1,padding:'8px 6px',borderRadius:'var(--r)',border:`1px solid ${payMethod===m?'var(--blue)':'var(--border)'}`,background:payMethod===m?'var(--blue-lt)':'var(--white)',cursor:'pointer',fontFamily:'var(--font)',fontSize:12,fontWeight:payMethod===m?700:400,color:payMethod===m?'var(--blue)':'var(--ink2)',transition:'all .15s' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {payMethod === 'card' && (
            <>
              <div className="field">
                <label className="label">Card Number</label>
                <input className="input" placeholder="1234 5678 9012 3456" maxLength={19} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim())} />
              </div>
              <div className="g2">
                <div className="field"><label className="label">Expiry</label><input className="input" placeholder="MM / YY" value={cardExp} onChange={e => setCardExp(e.target.value)} /></div>
                <div className="field"><label className="label">CVV</label><input className="input" placeholder="•••" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value)} /></div>
              </div>
              <div className="field">
                <label className="label">Name on Card</label>
                <input className="input" placeholder="Amit Gupta" value={cardName} onChange={e => setCardName(e.target.value)} />
              </div>
            </>
          )}
          {payMethod === 'upi' && (
            <div className="field"><label className="label">UPI ID</label><input className="input" placeholder="yourname@upi" /></div>
          )}

          <div className="xs muted mt2">🔒 Secured · PCI DSS Compliant · 256-bit Encrypted</div>

          <div className="divider" />
          <div style={{ background:'var(--surface)',borderRadius:'var(--r)',padding:12 }}>
            {selSvcs.map(s => <div key={s.id} className="flex jsb" style={{ fontSize:12,color:'var(--ink2)',marginBottom:4 }}><span>{s.name}</span><span>₹{s.price}</span></div>)}
            {discount > 0 && <div className="flex jsb" style={{ fontSize:12,color:'var(--green)',marginBottom:4 }}><span>Discount</span><span>−₹{discount}</span></div>}
            <div className="flex jsb bold" style={{ fontSize:14,borderTop:'1px solid var(--border)',paddingTop:8,marginTop:4 }}>
              <span>Paying now</span>
              <span style={{ color:'var(--blue)' }}>₹{payType==='deposit' ? finalDeposit : finalTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 5: Confirmed ── */}
      {step === 5 && booking && (
        <div className="card tc" style={{ padding:'40px 24px' }}>
          <div style={{ width:68,height:68,background:'var(--green-lt)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:30 }}>✅</div>
          <div style={{ fontFamily:'var(--font-d)',fontSize:22,fontWeight:800,marginBottom:6 }}>Booking Confirmed!</div>
          <p className="muted sm mb4">#{booking.ref} · {provider.name} will arrive at {slot}</p>
          <div style={{ background:'var(--surface)',borderRadius:'var(--r)',padding:14,textAlign:'left',marginBottom:20 }}>
            {[['Provider',provider.name],['Slot',`${slot} · ${date}`],['Services',selSvcs.map(s=>s.name).join(', ')],['Total',`₹${finalTotal}`]].map(([k,v]) => (
              <div key={k} className="flex jsb" style={{ fontSize:13,marginBottom:8,borderBottom:'1px solid var(--border)',paddingBottom:8 }}>
                <span className="muted">{k}</span><span className="bold">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap2">
            <button className="btn btn-outline f1" onClick={() => navigate('/track', { state:{ bookingId: booking.id } })}>📍 Track</button>
            <button className="btn btn-primary f1" onClick={() => navigate('/receipt', { state:{ bookingId: booking.id } })}>🧾 Receipt</button>
          </div>
        </div>
      )}

      {/* Nav buttons */}
      {step < 5 && (
        <div className="flex gap2 mt3">
          {step > 1 && <button className="btn btn-outline f1" onClick={() => setStep(s => s-1)}>← Back</button>}
          <button className="btn btn-primary f1" disabled={!canNext || loading} onClick={next}>
            {loading ? <><span className="spin" /> Processing…</> : step === 4 ? '🔒 Pay & Confirm' : 'Continue →'}
          </button>
        </div>
      )}
    </div>
  );
}
