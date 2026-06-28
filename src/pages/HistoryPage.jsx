import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context';
import { useToast } from '../context';

const SC = {
  completed:   { bg:'var(--green-lt)',  fg:'var(--green)'  },
  cancelled:   { bg:'var(--red-lt)',    fg:'var(--red)'    },
  pending:     { bg:'var(--amber-lt)',  fg:'var(--amber)'  },
  confirmed:   { bg:'var(--blue-lt)',   fg:'var(--blue)'   },
  en_route:    { bg:'var(--teal-lt)',   fg:'var(--teal)'   },
  accepted:    { bg:'var(--blue-lt)',   fg:'var(--blue)'   },
  in_progress: { bg:'var(--teal-lt)',   fg:'var(--teal)'   },
};

export default function HistoryPage() {
  const { myBookings } = useStore();
  const navigate = useNavigate();
  const toast    = useToast();
  const [filter, setFilter] = useState('all');

  const list     = filter === 'all' ? myBookings : myBookings.filter(b => b.status === filter);
  const spent    = myBookings.filter(b => b.status === 'completed').reduce((s,b) => s + b.total, 0);
  const doneCount = myBookings.filter(b => b.status === 'completed').length;

  return (
    <div className="page-sm">
      <div className="sec-title mb1">Service History</div>
      <div className="sec-sub mb3">All your bookings and reviews</div>

      <div className="g2 mb3">
        <div className="card tc"><div style={{ fontSize:26,fontWeight:800,fontFamily:'var(--font-d)',color:'var(--blue)' }}>₹{spent.toLocaleString()}</div><div className="xs muted mt1">Total spent</div></div>
        <div className="card tc"><div style={{ fontSize:26,fontWeight:800,fontFamily:'var(--font-d)',color:'var(--green)' }}>{doneCount}</div><div className="xs muted mt1">Completed</div></div>
      </div>

      <div className="flex gap2 mb3 fw">
        {[['all','All'],['completed','Completed'],['confirmed','Active'],['cancelled','Cancelled']].map(([f,l]) => (
          <button key={f} className={`chip${filter===f?' active':''}`} onClick={() => setFilter(f)}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="tc" style={{ padding:60 }}>
          <div style={{ fontSize:40,marginBottom:12 }}>📋</div>
          <p className="muted mb3">No bookings yet.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Book a Service</button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {list.map(b => {
            const sc   = SC[b.status] || SC.pending;
            const svcs = Array.isArray(b.services) ? b.services : [];
            return (
              <div key={b.id} className="card">
                <div className="flex jsb aic mb2" style={{ flexWrap:'wrap', gap:6 }}>
                  <div>
                    <div className="bold">{b.providerName}</div>
                    <div className="xs muted">{b.category} · {b.date} · {b.time}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span className="badge" style={{ background:sc.bg, color:sc.fg, textTransform:'capitalize' }}>
                      {b.status.replace(/_/g,' ')}
                    </span>
                    <div className="bold" style={{ color:'var(--blue)',marginTop:4 }}>₹{b.total}</div>
                  </div>
                </div>

                <div className="xs muted mb2">{svcs.map(s => s.name).join(', ')} · #{b.ref}</div>

                {b.review && (
                  <div style={{ background:'var(--surface)',borderRadius:'var(--r)',padding:10,marginBottom:12 }}>
                    <div className="flex aic gap2 mb1">
                      <span className="stars">{'★'.repeat(b.review.rating)}{'☆'.repeat(5-b.review.rating)}</span>
                      <span className="xs muted">Your review</span>
                    </div>
                    <p className="xs muted" style={{ fontStyle:'italic' }}>"{b.review.text}"</p>
                  </div>
                )}

                <div className="flex gap2 fw">
                  {b.status === 'completed' && (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/receipt',{state:{bookingId:b.id}})}>🧾 Invoice</button>
                      <button className="btn btn-primary btn-sm" onClick={() => toast('Re-booking…','info')}>🔁 Book Again</button>
                    </>
                  )}
                  {['confirmed','accepted','en_route','arrived','in_progress'].includes(b.status) && (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/track',{state:{bookingId:b.id}})}>📍 Track</button>
                  )}
                  {b.status === 'completed' && !b.review && (
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/track',{state:{bookingId:b.id}})}>⭐ Review</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
