import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context';
import { useToast } from '../context';

const SC = {
  pending:     { bg:'var(--amber-lt)',  fg:'var(--amber)'  },
  confirmed:   { bg:'var(--blue-lt)',   fg:'var(--blue)'   },
  accepted:    { bg:'var(--blue-lt)',   fg:'var(--blue)'   },
  en_route:    { bg:'var(--teal-lt)',   fg:'var(--teal)'   },
  arrived:     { bg:'var(--teal-lt)',   fg:'var(--teal)'   },
  in_progress: { bg:'var(--teal-lt)',   fg:'var(--teal)'   },
  completed:   { bg:'var(--green-lt)',  fg:'var(--green)'  },
  cancelled:   { bg:'var(--red-lt)',    fg:'var(--red)'    },
};
const NEXT = { pending:'accepted',confirmed:'accepted',accepted:'en_route',en_route:'arrived',arrived:'in_progress',in_progress:'completed' };
const NEXT_LABEL = { pending:'✓ Accept',confirmed:'✓ Accept',accepted:'🏍 En Route',en_route:'🏠 Arrived',arrived:'🔧 Start',in_progress:'✅ Complete' };

export default function JobsPage() {
  const { myBookings, updateBookingStatus } = useStore();
  const navigate = useNavigate();
  const toast    = useToast();
  const [filter, setFilter] = useState('all');

  const list = filter === 'all' ? myBookings : myBookings.filter(b => b.status === filter);
  const counts = {
    pending:   myBookings.filter(b => b.status === 'pending').length,
    active:    myBookings.filter(b => ['confirmed','accepted','en_route','arrived','in_progress'].includes(b.status)).length,
    completed: myBookings.filter(b => b.status === 'completed').length,
  };

  const advance = (id, next) => {
    updateBookingStatus(id, next);
    toast(`Marked as ${next.replace(/_/g,' ')}`, 'success');
  };

  const cancel = (id) => {
    updateBookingStatus(id, 'cancelled');
    toast('Job declined', 'info');
  };

  return (
    <div className="page-sm">
      <div className="sec-title mb1">My Jobs</div>
      <div className="sec-sub mb3">Manage all incoming and active requests</div>

      <div className="g3 mb3">
        {[['Pending',counts.pending,'var(--amber)'],['Active',counts.active,'var(--teal)'],['Completed',counts.completed,'var(--green)']].map(([l,v,c]) => (
          <div key={l} className="card tc" style={{ padding:'13px 10px' }}>
            <div style={{ fontSize:24,fontWeight:800,fontFamily:'var(--font-d)',color:c }}>{v}</div>
            <div className="xs muted mt1">{l}</div>
          </div>
        ))}
      </div>

      <div className="flex gap2 mb3 fw">
        {[['all','All'],['pending','Pending'],['accepted','Accepted'],['en_route','En Route'],['completed','Completed'],['cancelled','Cancelled']].map(([f,l]) => (
          <button key={f} className={`chip${filter===f?' active':''}`} onClick={() => setFilter(f)}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="tc" style={{ padding:60 }}>
          <div style={{ fontSize:40,marginBottom:12 }}>💼</div>
          <p className="muted">No jobs in this category yet.</p>
        </div>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {list.map(j => {
            const sc   = SC[j.status] || SC.pending;
            const svcs = Array.isArray(j.services) ? j.services : [];
            const next = NEXT[j.status];
            return (
              <div key={j.id} className="card">
                <div className="flex jsb aic mb2" style={{ flexWrap:'wrap',gap:6 }}>
                  <div>
                    <div className="bold">{j.customerName || 'Customer'}</div>
                    <div className="xs muted">{j.date} · {j.time} · #{j.ref}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <span className="badge" style={{ background:sc.bg,color:sc.fg,textTransform:'capitalize' }}>{j.status.replace(/_/g,' ')}</span>
                    <div className="bold mt1" style={{ color:'var(--blue)' }}>₹{j.total}</div>
                  </div>
                </div>

                <div className="xs muted mb1">🔧 {svcs.map(s=>s.name).join(', ') || '—'}</div>
                <div className="xs muted mb3">📍 {j.address || 'No address'}</div>

                <div className="flex gap2 fw">
                  {next && (
                    <button className="btn btn-primary btn-sm" onClick={() => advance(j.id, next)}>{NEXT_LABEL[j.status]}</button>
                  )}
                  {['pending','confirmed','accepted'].includes(j.status) && (
                    <button className="btn btn-danger btn-sm" onClick={() => cancel(j.id)}>✕ Decline</button>
                  )}
                  {['accepted','en_route','arrived','in_progress'].includes(j.status) && (
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/track',{state:{bookingId:j.id}})}>📍 Track</button>
                  )}
                  {j.status === 'completed' && (
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/receipt',{state:{bookingId:j.id}})}>🧾 Invoice</button>
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
