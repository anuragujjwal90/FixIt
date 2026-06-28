import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useStore } from '../context';
import { useToast } from '../context';
import { CATEGORIES } from '../data';

const PLAN_ORDER = { elite:0, pro:1, basic:2 };

function Stars({ r }) {
  return <span className="stars">{[1,2,3,4,5].map(i => i<=Math.round(r)?'★':'☆').join('')}</span>;
}

function ProviderCard({ p, onBook }) {
  return (
    <div className="pcard" onClick={onBook}>
      <div style={{ padding:'14px', display:'flex', gap:10, borderBottom:'1px solid var(--surface)' }}>
        <div className="ava" style={{ width:46,height:46,fontSize:14,background:p.color.bg,color:p.color.fg }}>{p.avatar}</div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700,fontSize:14 }}>{p.name}</div>
          <div style={{ fontSize:11,color:'var(--ink3)' }}>{p.title} · {p.experience}yr exp</div>
          <div style={{ display:'flex',gap:4,marginTop:5,flexWrap:'wrap' }}>
            {p.verified && <span className="badge badge-blue">✓ Verified</span>}
            <span className={`badge ${p.available?'badge-green':'badge-amber'}`}>{p.available?'● Available':'⏱ Busy'}</span>
            {p.surge && <span className="badge badge-amber">⚡ Surge</span>}
            {p.plan==='elite' && <span className="badge badge-teal">★ Elite</span>}
            {p.plan==='pro'   && <span className="badge badge-blue">Pro</span>}
          </div>
        </div>
      </div>
      <div style={{ padding:'12px 14px' }}>
        <div className="flex aic gap2 mb2">
          <Stars r={p.rating} />
          <span style={{ fontWeight:700,fontSize:12 }}>{p.rating||'New'}</span>
          <span className="xs muted">({p.reviews} reviews)</span>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:10 }}>
          <div style={{ background:'var(--surface)',borderRadius:'var(--r)',padding:'8px',textAlign:'center' }}>
            <div style={{ fontWeight:700,fontSize:15 }}>{p.jobs}+</div>
            <div style={{ fontSize:10,color:'var(--ink3)' }}>Jobs Done</div>
          </div>
          <div style={{ background:'var(--surface)',borderRadius:'var(--r)',padding:'8px',textAlign:'center' }}>
            <div style={{ fontWeight:700,fontSize:13 }}>{p.area.split(',')[0]}</div>
            <div style={{ fontSize:10,color:'var(--ink3)' }}>Area</div>
          </div>
        </div>
        <div className="flex jsb aic">
          <div>
            <div style={{ fontSize:15,fontWeight:700,color:'var(--blue)' }}>
              ₹{Math.min(...(p.services||[{price:0}]).map(s=>s.price))}–₹{Math.max(...(p.services||[{price:0}]).map(s=>s.price))}
            </div>
            <div className="xs muted">per service</div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();onBook();}}>Book Now</button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { providers } = useStore();
  const toast    = useToast();
  const navigate = useNavigate();

  const [cat,    setCat]    = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [catSel, setCatSel] = useState('All services');

  const goBook = (p) => {
    if (!user) { toast('Sign in to book a service', 'info'); navigate('/auth'); return; }
    navigate('/booking', { state: { provider: p } });
  };

  let list = [...providers];
  if (cat)              list = list.filter(p => p.category === cat);
  if (filter==='available') list = list.filter(p => p.available);
  if (filter==='top')   list = [...list].sort((a,b) => b.rating - a.rating);
  if (filter==='verified') list = list.filter(p => p.verified);
  if (filter==='budget') list = [...list].sort((a,b) => Math.min(...a.services.map(s=>s.price)) - Math.min(...b.services.map(s=>s.price)));
  list.sort((a,b) => (PLAN_ORDER[a.plan]??2)-(PLAN_ORDER[b.plan]??2) || b.rating-a.rating);

  const handleSearch = () => {
    const c = catSel === 'All services' ? null : catSel;
    setCat(c);
    toast(`Showing ${c||'all'} providers near ${search||'Lucknow'}`, 'success');
  };

  return (
    <>
      {/* Hero */}
      <div className="hero">
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <h1>Trusted Professionals,<br />At Your Doorstep</h1>
          <p>Book verified local experts — plumbers, electricians, cleaners &amp; more</p>
          <div className="search-bar">
            <span style={{ padding:'8px 4px 8px 10px', fontSize:17 }}>📍</span>
            <input
              placeholder="Enter your location…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSearch()}
            />
            <select value={catSel} onChange={e => setCatSel(e.target.value)}>
              <option>All services</option>
              {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <button onClick={handleSearch}>🔍 Search</button>
          </div>
          <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
            {['✅ Background verified','⭐ 4.8 avg rating','⚡ Same-day available'].map(t => (
              <span key={t} style={{ fontSize:12, color:'rgba(255,255,255,.7)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="page">
        {/* Categories */}
        <div style={{ marginBottom:28 }}>
          <div className="sec-title mb1">Browse by Category</div>
          <div className="sec-sub mb3">500+ verified professionals in Lucknow</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:9 }}>
            {CATEGORIES.map(c => (
              <div
                key={c.name}
                className={`cat-card${cat===c.name?' active':''}`}
                onClick={() => setCat(cat===c.name ? null : c.name)}
              >
                <div style={{ fontSize:24 }}>{c.icon}</div>
                <div className="name">{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Provider listing */}
        <div>
          <div className="flex jsb aic mb2 fw" style={{ gap:8 }}>
            <div>
              <div className="sec-title">{cat ? cat+' Providers' : 'Top Rated Providers'}</div>
              <div className="sec-sub">{list.length} providers · sorted by plan &amp; rating</div>
            </div>
            <div className="flex aic gap2 xs" style={{ color:'var(--green)' }}>
              <span className="pulse" /> Live availability
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap2 mb3 fw">
            {[['all','All'],['available','Available Now'],['top','Top Rated'],['verified','Verified Pro'],['budget','Budget Friendly']].map(([f,l]) => (
              <button key={f} className={`chip${filter===f?' active':''}`} onClick={() => setFilter(f)}>{l}</button>
            ))}
          </div>

          {list.length === 0 ? (
            <div className="tc" style={{ padding:60 }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
              <p className="muted">No providers found. Try a different filter.</p>
            </div>
          ) : (
            <div className="g-auto">
              {list.map(p => <ProviderCard key={p.id} p={p} onBook={() => goBook(p)} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
