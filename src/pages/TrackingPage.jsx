import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchBooking, updateBookingStatus, subscribeToBooking } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STATUS_ORDER = ['confirmed','accepted','en_route','arrived','in_progress','completed'];
const STATUS_LABELS = {
  confirmed: 'Booking Confirmed', accepted: 'Provider Accepted',
  en_route: 'Provider En Route', arrived: 'Provider Arrived',
  in_progress: 'Service In Progress', completed: 'Service Completed',
};
const STATUS_ICONS = {
  confirmed:'✅', accepted:'👍', en_route:'🏍️', arrived:'🏠', in_progress:'🔧', completed:'🎉',
};

function Stars({rating}) {
  return <span className="se-stars">{[1,2,3,4,5].map(i=>i<=rating?'★':'☆').join('')}</span>;
}

export default function TrackingPage() {
  const location = useLocation();
  const { user, profile, isProvider, provider } = useAuth();
  const toast = useToast();
  const bookingId = location.state?.bookingId;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating]   = useState(0);
  const [review, setReview]   = useState('');
  const [showReview, setShowReview] = useState(false);
  const [tip, setTip]         = useState(0);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    fetchBooking(bookingId).then(b => setBooking(b)).catch(() => toast('Could not load booking','error')).finally(() => setLoading(false));

    // Realtime subscription
    const channel = subscribeToBooking(bookingId, updated => {
      setBooking(prev => ({ ...prev, ...updated }));
    });
    return () => channel.unsubscribe?.();
  }, [bookingId]);

  const advanceStatus = async () => {
    const current = booking.status;
    const idx = STATUS_ORDER.indexOf(current);
    const next = STATUS_ORDER[idx + 1];
    if (!next) return;
    try {
      const updated = await updateBookingStatus(bookingId, next);
      setBooking(prev => ({ ...prev, ...updated }));
      toast(`Status: ${STATUS_LABELS[next]}`, 'success');
      if (next === 'completed') setShowReview(true);
    } catch { toast('Update failed','error'); }
  };

  const handleReview = async () => {
    if (rating === 0) { toast('Select a rating','warning'); return; }
    toast('Review submitted! Thank you 🙏','success');
    setReviewDone(true);
    setShowReview(false);
  };

  if (loading) return <div style={{textAlign:'center',padding:80}}><span className="se-spinner" style={{width:32,height:32,margin:'0 auto'}} /></div>;

  if (!booking) return (
    <div className="se-page-narrow" style={{textAlign:'center',paddingTop:60}}>
      <div style={{fontSize:40,marginBottom:12}}>📍</div>
      <p style={{color:'var(--ink-3)',marginBottom:8}}>No active booking to track.</p>
      <p style={{fontSize:12,color:'var(--ink-4)'}}>Book a service to see live tracking here.</p>
    </div>
  );

  const currentIdx = STATUS_ORDER.indexOf(booking.status);
  const isEnRoute = booking.status === 'en_route';
  const isCompleted = booking.status === 'completed';
  const prov = booking.provider;

  return (
    <div className="se-page-narrow">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:20,flexWrap:'wrap',gap:8}}>
        <div>
          <div className="se-section-title">Live Tracking</div>
          <div className="se-section-sub">#{booking.booking_ref} · {booking.provider_name}</div>
        </div>
        <span style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:700,color:'var(--teal)'}}>
          <span className="se-pulse" style={{background:'var(--teal)'}} /> {STATUS_LABELS[booking.status] || booking.status}
        </span>
      </div>

      {/* Map */}
      <div className="se-map-box" style={{marginBottom:16}}>
        <div className="se-map-pin">📍</div>
        {isEnRoute && <div className="se-map-rider">🏍️</div>}
        <div className="se-map-home">🏠</div>
        {isEnRoute && <div className="se-map-eta">⏱ ETA ~12 min</div>}
        {!isEnRoute && !isCompleted && (
          <div className="se-map-eta">{STATUS_LABELS[booking.status]}</div>
        )}
        {isCompleted && <div className="se-map-eta" style={{color:'var(--green)'}}>✅ Completed</div>}
      </div>

      {/* Timeline */}
      <div className="se-card" style={{marginBottom:14}}>
        <div className="se-timeline">
          {STATUS_ORDER.map((s, i) => {
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <div key={s} className="se-tl-step">
                <div className={`se-tl-icon${done?' done':active?' active':''}`}>
                  {done ? '✓' : STATUS_ICONS[s]}
                </div>
                <div>
                  <div className="se-tl-note" style={{color:active?'var(--teal)':done?'var(--ink)':'var(--ink-4)'}}>{STATUS_LABELS[s]}</div>
                  {(booking.timeline || []).find(t => t.status === s) && (
                    <div className="se-tl-time">{booking.timeline.find(t=>t.status===s).time} · {booking.timeline.find(t=>t.status===s).note}</div>
                  )}
                  {!done && !active && <div className="se-tl-time">Pending</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Provider info */}
      {prov && (
        <div className="se-card" style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <div className="se-avatar" style={{width:44,height:44,background:'var(--blue-lt)',color:'var(--blue)',fontSize:14}}>{prov.avatar_initials||'?'}</div>
              <div>
                <div style={{fontWeight:600,fontSize:14}}>{prov.name}</div>
                <div style={{fontSize:11,color:'var(--ink-3)'}}><Stars rating={Math.round(prov.rating||0)} /> {prov.rating} · {booking.provider_category}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="se-btn se-btn-outline se-btn-sm" onClick={()=>toast(`Calling ${prov.phone||'provider'}…`,'info')}>📞</button>
              <button className="se-btn se-btn-outline se-btn-sm" onClick={()=>toast('Messaging provider…','info')}>💬</button>
            </div>
          </div>
        </div>
      )}

      {/* Provider advances status */}
      {isProvider && !isCompleted && (
        <div className="se-card" style={{marginBottom:14}}>
          <div style={{fontWeight:600,fontSize:13,marginBottom:10}}>Update Job Status</div>
          <button className="se-btn se-btn-teal se-btn-full" onClick={advanceStatus} disabled={currentIdx >= STATUS_ORDER.length-1}>
            Mark as: {STATUS_LABELS[STATUS_ORDER[currentIdx+1]] || 'Completed'}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {!isCompleted && (
          <button className="se-btn se-btn-outline" onClick={()=>toast('Cancellation: free up to 30 min before service','info')}>✕ Cancel</button>
        )}
        {isCompleted && !reviewDone && (
          <button className="se-btn se-btn-primary" onClick={()=>setShowReview(true)}>⭐ Rate Service</button>
        )}
        {reviewDone && (
          <div style={{padding:'10px 14px',background:'var(--green-lt)',borderRadius:'var(--r)',fontSize:12,color:'var(--green)',fontWeight:600,textAlign:'center'}}>✓ Review Submitted</div>
        )}
        <button className="se-btn se-btn-outline" onClick={()=>toast('Contact support: support@serveeasy.in','info')}>📞 Support</button>
      </div>

      {/* Review modal */}
      {showReview && (
        <div className="se-modal-overlay" onClick={e=>e.target===e.currentTarget&&setShowReview(false)}>
          <div className="se-modal se-anim-up">
            <div className="se-modal-head">
              <h3>Rate Your Service</h3>
              <button className="se-modal-close" onClick={()=>setShowReview(false)}>✕</button>
            </div>
            <div className="se-modal-body">
              <div style={{textAlign:'center',marginBottom:20}}>
                <div className="se-avatar" style={{width:56,height:56,background:'var(--blue-lt)',color:'var(--blue)',fontSize:18,margin:'0 auto 10px'}}>{booking.provider_name?.slice(0,2)||'?'}</div>
                <div style={{fontWeight:700}}>{booking.provider_name}</div>
                <div style={{fontSize:12,color:'var(--ink-3)'}}>{booking.provider_category}</div>
              </div>
              <div style={{textAlign:'center',marginBottom:16}}>
                <div style={{fontSize:13,marginBottom:10,color:'var(--ink-2)'}}>How was your experience?</div>
                <div style={{display:'flex',justifyContent:'center',gap:8}}>
                  {[1,2,3,4,5].map(i=>(
                    <span key={i} onClick={()=>setRating(i)} style={{fontSize:32,cursor:'pointer',color:i<=rating?'#F59E0B':'var(--border)',transition:'color .1s'}}>★</span>
                  ))}
                </div>
              </div>
              <div className="se-field">
                <label className="se-label">Your Review</label>
                <textarea className="se-input" rows={3} placeholder="Tell others about your experience…" value={review} onChange={e=>setReview(e.target.value)} style={{resize:'vertical'}} />
              </div>
              <div className="se-field">
                <label className="se-label">Tip Provider (optional)</label>
                <div style={{display:'flex',gap:6}}>
                  {[0,20,50,100].map(t=>(
                    <button key={t} onClick={()=>setTip(t)} style={{flex:1,padding:'8px 4px',borderRadius:'var(--r)',border:`1px solid ${tip===t?'var(--blue)':'var(--border)'}`,background:tip===t?'var(--blue-lt)':'var(--white)',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:tip===t?700:400,color:tip===t?'var(--blue)':'var(--ink)'}}>
                      {t===0?'No Tip':'₹'+t}
                    </button>
                  ))}
                </div>
              </div>
              <button className="se-btn se-btn-primary se-btn-full" onClick={handleReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
