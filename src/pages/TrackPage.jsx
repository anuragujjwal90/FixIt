import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context';
import { useAuth } from '../context';
import { useToast } from '../context';
import { PROVIDERS } from '../data';

const STATUS_ORDER = ['confirmed','accepted','en_route','arrived','in_progress','completed'];
const STATUS_LABEL = { confirmed:'Booking Confirmed',accepted:'Provider Accepted',en_route:'Provider En Route',arrived:'Provider Arrived',in_progress:'Service In Progress',completed:'Service Completed' };
const STATUS_ICON  = { confirmed:'✅',accepted:'👍',en_route:'🏍️',arrived:'🏠',in_progress:'🔧',completed:'🎉' };
const NEXT_STATUS  = { confirmed:'accepted',accepted:'en_route',en_route:'arrived',arrived:'in_progress',in_progress:'completed' };
const NEXT_LABEL   = { confirmed:'✓ Accept',accepted:'🏍 En Route',en_route:'🏠 Arrived',arrived:'🔧 Start Service',in_progress:'✅ Complete' };

export default function TrackPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { myBookings, updateBookingStatus, submitReview } = useStore();
  const { isProvider } = useAuth();
  const toast = useToast();

  const [rating,     setRating]     = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [tip,        setTip]        = useState(0);
  const [showModal,  setShowModal]  = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  const bookingId = state?.bookingId;
  const booking   = myBookings.find(b => b.id === bookingId) || myBookings[0];

  if (!booking) {
    return (
      <div className="page-sm tc" style={{ paddingTop:60 }}>
        <div style={{ fontSize:40, marginBottom:12 }}>📍</div>
        <p className="muted mb3">No active booking to track.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Book a Service</button>
      </div>
    );
  }

  const provider   = PROVIDERS.find(p => p.id === booking.providerId);
  const curIdx     = STATUS_ORDER.indexOf(booking.status);
  const isEnRoute  = booking.status === 'en_route';
  const isDone     = booking.status === 'completed';
  const nextStatus = NEXT_STATUS[booking.status];

  const advance = () => {
    if (!nextStatus) return;
    updateBookingStatus(booking.id, nextStatus);
    toast(STATUS_LABEL[nextStatus], 'success');
    if (nextStatus === 'completed') setShowModal(true);
  };

  const handleReview = () => {
    if (rating === 0) { toast('Select a rating first', 'warning'); return; }
    submitReview(booking.id, rating, reviewText, tip);
    setReviewDone(true);
    setShowModal(false);
    toast('Review submitted! Thank you 🙏', 'success');
  };

  return (
    <div className="page-sm">
      {/* Header */}
      <div className="flex jsb aic mb3 fw" style={{ gap:8 }}>
        <div>
          <div className="sec-title">Live Tracking</div>
          <div className="sec-sub">#{booking.ref} · {booking.providerName}</div>
        </div>
        <span className="flex aic gap2 xs bold" style={{ color:'var(--teal)' }}>
          <span className="pulse" style={{ background:'var(--teal)' }} />
          {STATUS_LABEL[booking.status] || booking.status}
        </span>
      </div>

      {/* Map */}
      <div className="map-box">
        <div className="map-pin" style={{ top:20, left:20 }}>📍</div>
        {isEnRoute && <div className="map-rider">🏍️</div>}
        <div className="map-home">🏠</div>
        {isEnRoute && <div className="map-eta">⏱ ETA ~12 min</div>}
        {isDone    && <div className="map-eta" style={{ color:'var(--green)' }}>✅ Completed</div>}
      </div>

      {/* Timeline */}
      <div className="card mb3">
        <div className="tl">
          {STATUS_ORDER.map((s, i) => {
            const done   = i < curIdx;
            const active = i === curIdx;
            const entry  = (booking.timeline || []).find(t => t.status === s);
            return (
              <div key={s} className="tl-row">
                <div className={`tl-dot${done?' done':active?' active':''}`}>
                  {done ? '✓' : STATUS_ICON[s]}
                </div>
                <div>
                  <div className="bold sm" style={{ color: active?'var(--teal)':done?'var(--ink)':'var(--ink4)' }}>
                    {STATUS_LABEL[s]}
                  </div>
                  <div className="xs muted">{entry ? `${entry.time} · ${entry.note}` : 'Pending'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider info */}
      {provider && (
        <div className="card mb3">
          <div className="flex jsb aic">
            <div className="flex gap3 aic">
              <div className="ava" style={{ width:42,height:42,fontSize:13,background:provider.color.bg,color:provider.color.fg }}>{provider.avatar}</div>
              <div>
                <div className="bold sm">{provider.name}</div>
                <div className="xs muted">
                  <span className="stars">{'★'.repeat(Math.round(provider.rating))}</span> {provider.rating} · {provider.reviews} reviews
                </div>
              </div>
            </div>
            <div className="flex gap2">
              <button className="btn btn-outline btn-sm" onClick={() => toast(`Calling ${provider.phone}…`, 'info')}>📞</button>
              <button className="btn btn-outline btn-sm" onClick={() => toast('Opening chat…', 'info')}>💬</button>
            </div>
          </div>
        </div>
      )}

      {/* Provider advances status */}
      {isProvider && !isDone && nextStatus && (
        <div className="card mb3">
          <div className="bold sm mb2">Update Job Status</div>
          <button className="btn btn-teal btn-full" onClick={advance}>{NEXT_LABEL[booking.status]}</button>
        </div>
      )}

      {/* Customer actions */}
      {!isProvider && (
        <div className="g2">
          {!isDone && (
            <button className="btn btn-outline" onClick={() => { updateBookingStatus(booking.id,'cancelled'); toast('Booking cancelled','info'); navigate('/history'); }}>
              ✕ Cancel
            </button>
          )}
          {isDone && !reviewDone && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>⭐ Rate Service</button>
          )}
          {isDone && reviewDone && (
            <div style={{ padding:'10px 14px',background:'var(--green-lt)',borderRadius:'var(--r)',fontSize:12,color:'var(--green)',fontWeight:600,textAlign:'center' }}>✓ Review Submitted</div>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/receipt', { state:{ bookingId: booking.id } })}>🧾 Receipt</button>
        </div>
      )}

      {/* Rating modal */}
      {showModal && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <span className="bold">Rate Your Service</span>
              <button style={{ background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--ink3)' }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tc mb3">
                <div className="ava" style={{ width:54,height:54,fontSize:16,background:'var(--blue-lt)',color:'var(--blue)',margin:'0 auto 8px' }}>
                  {provider?.avatar || '??'}
                </div>
                <div className="bold">{booking.providerName}</div>
                <div className="xs muted">{booking.category}</div>
              </div>

              <div className="tc mb3">
                <div className="sm muted mb2">How was your experience?</div>
                <div className="flex jsb" style={{ padding:'0 40px' }}>
                  {[1,2,3,4,5].map(i => (
                    <span key={i} onClick={() => setRating(i)} style={{ fontSize:32,cursor:'pointer',color:i<=rating?'#F59E0B':'var(--border)',transition:'color .1s' }}>★</span>
                  ))}
                </div>
              </div>

              <div className="field">
                <label className="label">Your Review</label>
                <textarea className="input" rows={3} placeholder="Tell others about your experience…" value={reviewText} onChange={e => setReviewText(e.target.value)} style={{ resize:'vertical' }} />
              </div>

              <div className="field">
                <label className="label">Tip Provider (optional)</label>
                <div className="flex gap2">
                  {[0,20,50,100].map(t => (
                    <button key={t} type="button" onClick={() => setTip(t)} style={{ flex:1,padding:'8px 4px',borderRadius:'var(--r)',border:`1px solid ${tip===t?'var(--blue)':'var(--border)'}`,background:tip===t?'var(--blue-lt)':'var(--white)',cursor:'pointer',fontFamily:'var(--font)',fontSize:12,fontWeight:tip===t?700:400,color:tip===t?'var(--blue)':'var(--ink)' }}>
                      {t === 0 ? 'No Tip' : `₹${t}`}
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-full" onClick={handleReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
