import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useStore } from '../context';
import { useToast } from '../context';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const SC   = { pending:'var(--amber)',confirmed:'var(--blue)',accepted:'var(--teal)',en_route:'var(--teal)',in_progress:'var(--blue)',completed:'var(--green)',cancelled:'var(--red)' };

export default function DashboardPage() {
  const { provider, isProvider } = useAuth();
  const { myBookings, updateBookingStatus, updateProviderAvailability, updateProviderPlan } = useStore();
  const navigate = useNavigate();
  const toast    = useToast();
  const [planModal, setPlanModal] = useState(false);

  if (!isProvider || !provider) return null;

  const online  = provider.available;
  const weekly  = Array.isArray(provider.weeklyEarnings) ? provider.weeklyEarnings : [0,0,0,0,0,0,0];
  const wMax    = Math.max(...weekly, 1);
  const pending  = myBookings.filter(b => b.status === 'pending');
  const active   = myBookings.filter(b => ['confirmed','accepted','en_route','arrived','in_progress'].includes(b.status));

  const toggleOnline = () => {
    updateProviderAvailability(provider.id, !online);
    toast(!online ? 'You are now Online ✓' : 'You are now Offline', !online ? 'success' : 'info');
  };

  const accept = (id) => { updateBookingStatus(id, 'accepted'); toast('Job accepted!', 'success'); };
  const decline = (id) => { updateBookingStatus(id, 'cancelled'); toast('Job declined', 'info'); };

  const upgradePlan = (plan) => {
    updateProviderPlan(provider.id, plan);
    toast(`Switched to ${plan.toUpperCase()} plan`, 'success');
    setPlanModal(false);
  };

  const METRICS = [
    ["Today's Earnings",  `₹${(provider.earnings?.today||0).toLocaleString()}`,  '↑ 18% vs yesterday'],
    ['Jobs Completed',    String(myBookings.filter(b=>b.status==='completed').length || 5), '↑ 2 above average'],
    ['Rating',            (provider.rating||4.9).toFixed(1),                     'Top 5% providers'],
    ['Acceptance Rate',   '96%',                                                  'Keep above 90%'],
    ['Pending Requests',  String(pending.length),                                 pending.length > 0 ? '● Needs attention' : '✓ All clear'],
    ['This Month',        `₹${(provider.earnings?.month||0).toLocaleString()}`,   '↑ 22% vs last month'],
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex jsb aic mb3 fw" style={{ gap:12 }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-d)',fontSize:22,fontWeight:800 }}>Good morning, {provider.name.split(' ')[0]} 👋</h2>
          <div className="xs muted">Lucknow · {new Date().toDateString()}</div>
        </div>
        <div className="flex aic gap2">
          <span className="xs bold" style={{ color: online ? 'var(--green)' : 'var(--ink4)' }}>{online ? 'Online' : 'Offline'}</span>
          <label className="toggle">
            <input type="checkbox" checked={online} onChange={toggleOnline} />
            <div className="toggle-track" />
          </label>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:11,marginBottom:20 }}>
        {METRICS.map(([l,v,n]) => (
          <div key={l} className="metric">
            <div className="metric-l">{l}</div>
            <div className="metric-v">{v}</div>
            <div className="metric-c">{n}</div>
          </div>
        ))}
      </div>

      <div className="g2 mb3" style={{ alignItems:'start' }}>
        {/* Job queue */}
        <div className="card">
          <div className="flex jsb aic mb3">
            <span className="bold sm">Job Queue</span>
            <span className="badge badge-amber">{pending.length} pending</span>
          </div>
          {myBookings.length === 0 ? (
            <p className="xs muted tc" style={{ padding:20 }}>No jobs yet 🎉</p>
          ) : (
            myBookings.slice(0,6).map(j => {
              const svcs = Array.isArray(j.services) ? j.services : [];
              return (
                <div key={j.id} style={{ padding:'10px 0',borderBottom:'1px solid var(--surface)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div>
                    <div className="sm bold">{svcs.map(s=>s.name).join(', ') || 'Service'}</div>
                    <div className="xs muted">{j.providerName || 'Customer'} · {j.time}</div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4 }}>
                    <span className="xs bold" style={{ padding:'2px 7px',borderRadius:10,background:'var(--surface)',color:SC[j.status]||'var(--ink3)',textTransform:'capitalize' }}>
                      {j.status.replace(/_/g,' ')}
                    </span>
                    {j.status === 'pending' && (
                      <div className="flex gap1">
                        <button className="btn btn-success btn-sm" style={{ padding:'3px 8px',fontSize:10 }} onClick={() => accept(j.id)}>✓ Accept</button>
                        <button className="btn btn-danger  btn-sm" style={{ padding:'3px 8px',fontSize:10 }} onClick={() => decline(j.id)}>✕</button>
                      </div>
                    )}
                    {['confirmed','accepted'].includes(j.status) && (
                      <button className="btn btn-teal btn-sm" style={{ padding:'3px 8px',fontSize:10 }} onClick={() => navigate('/track',{state:{bookingId:j.id}})}>Track →</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column */}
        <div style={{ display:'flex',flexDirection:'column',gap:14 }}>
          {/* Earnings chart */}
          <div className="card">
            <div className="bold sm mb2">Weekly Earnings</div>
            <div className="ebar">
              {weekly.map((v,i) => (
                <div key={i} className="ecol">
                  <div className="ebar-b" style={{ height:`${Math.round(v/wMax*100)}%` }} title={`₹${v}`} />
                  <div className="ebar-d">{DAYS[i]}</div>
                </div>
              ))}
            </div>
            <div style={{ height:18 }} />
            <div className="xs muted">Week total: <strong style={{ color:'var(--blue)' }}>₹{(provider.earnings?.week||0).toLocaleString()}</strong></div>
          </div>

          {/* Subscription */}
          <div className="card">
            <div className="bold sm mb2">Subscription</div>
            <div className="flex jsb aic">
              <div>
                <span className="badge badge-blue" style={{ display:'inline-block',marginBottom:4 }}>{(provider.plan||'basic').toUpperCase()}</span>
                <div className="xs muted">
                  {provider.plan==='elite'?'Top 3 placement + support':provider.plan==='pro'?'Priority listing + verified badge':'Standard listing'}
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setPlanModal(true)}>Upgrade</button>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div className="bold sm mb2">Documents</div>
            {Object.entries(provider.docs||{}).map(([doc,status]) => (
              <div key={doc} className="flex aic gap2" style={{ marginBottom:8 }}>
                <span>{status==='verified'?'✅':status==='pending'?'⏳':'❌'}</span>
                <div style={{ flex:1 }}>
                  <div className="xs bold" style={{ textTransform:'capitalize' }}>{doc.replace(/([A-Z])/g,' $1')}</div>
                </div>
                <span className="xs bold" style={{ color:status==='verified'?'var(--green)':'var(--amber)',textTransform:'capitalize' }}>{status}</span>
              </div>
            ))}
            <button className="btn btn-outline btn-sm btn-full mt2" onClick={() => navigate('/onboarding')}>Manage Docs</button>
          </div>
        </div>
      </div>

      {/* Plan modal */}
      {planModal && (
        <div className="modal-ov" onClick={e => e.target===e.currentTarget && setPlanModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <span className="bold">Upgrade Plan</span>
              <button style={{ background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--ink3)' }} onClick={() => setPlanModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
                {[
                  { plan:'basic', price:'Free',      features:['Listed in search','Standard ranking'],                         missing:['Verified badge','Priority listing'] },
                  { plan:'pro',   price:'₹999/mo',   features:['Priority listing','Verified badge','Analytics'],               missing:['Top 3 placement'] },
                  { plan:'elite', price:'₹1,999/mo', features:['Top 3 placement','Verified badge','Analytics','Dedicated support','Surge pricing access'], missing:[] },
                ].map(({ plan,price,features,missing }) => (
                  <div key={plan} className={`plan${provider.plan===plan?' active':''}`} onClick={() => plan!==provider.plan && upgradePlan(plan)}>
                    <div className="flex jsb aic mb2">
                      <div className="bold sm" style={{ textTransform:'capitalize' }}>{plan}</div>
                      <div className="plan-price">{price}</div>
                    </div>
                    {features.map(f => <div key={f} className="plan-feat"><span style={{ color:'var(--green)' }}>✓</span>{f}</div>)}
                    {missing.map(f  => <div key={f} className="plan-feat" style={{ color:'var(--border)' }}><span>✕</span>{f}</div>)}
                    {provider.plan === plan && <div className="xs mt2" style={{ color:'var(--blue)',fontWeight:600 }}>✓ Current plan</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
