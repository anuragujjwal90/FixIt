import React, { useState } from 'react';
import { useAuth } from '../context';
import { useStore } from '../context';
import { useToast } from '../context';

const CATS = ['Electrical','Plumbing','Cleaning','Carpentry','Painting','AC Repair','Pest Control','Locksmith','Appliances'];

export default function OnboardingPage() {
  const { provider } = useAuth();
  const { updateProviderProfile, updateProviderPlan } = useStore();
  const toast = useToast();

  const [name,       setName]       = useState(provider?.name || '');
  const [phone,      setPhone]      = useState(provider?.phone || '');
  const [category,   setCategory]   = useState(provider?.category || 'Electrical');
  const [title,      setTitle]      = useState(provider?.title || '');
  const [experience, setExperience] = useState(String(provider?.experience || 1));
  const [bio,        setBio]        = useState(provider?.bio || '');
  const [saving,     setSaving]     = useState(false);

  if (!provider) return null;

  const docs = provider.docs || { aadhaar:'pending', license:'pending', background:'pending' };

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      updateProviderProfile(provider.id, { name, phone, category, title: title || category+' Professional', experience: parseInt(experience)||1, bio });
      toast('Profile saved!', 'success');
      setSaving(false);
    }, 600);
  };

  const docIcon  = s => s==='verified'?'✅':s==='pending'?'⏳':'❌';
  const docColor = s => s==='verified'?'var(--green)':s==='pending'?'var(--amber)':'var(--red)';

  const upgradePlan = (plan) => {
    updateProviderPlan(provider.id, plan);
    toast(`Switched to ${plan.toUpperCase()} plan`, 'success');
  };

  return (
    <div className="page-sm">
      <div className="sec-title mb1">Provider Profile</div>
      <div className="sec-sub mb3">Manage your profile, documents and subscription</div>

      {/* Personal details */}
      <div className="card mb3">
        <div className="bold sm mb3">🧑 Personal Details</div>
        <div className="g2">
          <div className="field">
            <label className="label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="label">Phone</label>
            <input className="input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="g2">
          <div className="field">
            <label className="label">Category</label>
            <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Experience (years)</label>
            <input className="input" type="number" min="0" value={experience} onChange={e => setExperience(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="label">Professional Title</label>
          <input className="input" placeholder="e.g. Master Electrician" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Bio</label>
          <textarea className="input" rows={3} placeholder="Tell customers about your expertise…" value={bio} onChange={e => setBio(e.target.value)} style={{ resize:'vertical' }} />
        </div>
        <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
          {saving ? <><span className="spin" /> Saving…</> : '💾 Save Profile'}
        </button>
      </div>

      {/* Documents */}
      <div className="card mb3">
        <div className="bold sm mb3">📄 Verification Documents</div>
        <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:16 }}>
          {[['aadhaar','Aadhaar Card'],['license','Trade License'],['background','Background Check']].map(([key,label]) => (
            <div key={key} className="flex aic gap2" style={{ padding:'11px 13px',border:'1px solid var(--border)',borderRadius:'var(--r)' }}>
              <span style={{ fontSize:18 }}>{docIcon(docs[key])}</span>
              <div style={{ flex:1 }}>
                <div className="sm bold">{label}</div>
                <div className="xs" style={{ color:docColor(docs[key]),textTransform:'capitalize',marginTop:1 }}>{docs[key]}</div>
              </div>
              {docs[key] !== 'verified' && (
                <button className="btn btn-outline btn-sm" onClick={() => toast(`${label} upload coming soon`,'info')}>Upload</button>
              )}
            </div>
          ))}
        </div>
        <div className="upload" onClick={() => toast('File picker opening…','info')}>
          <div style={{ fontSize:30,marginBottom:6 }}>☁️</div>
          <div className="bold sm">Drag &amp; drop or click to upload</div>
          <div className="xs muted mt1">PDF, JPG, PNG · Max 5 MB each</div>
        </div>
      </div>

      {/* Subscription */}
      <div className="card">
        <div className="bold sm mb1">👑 Subscription Plan</div>
        <div className="xs muted mb3">Higher plan = priority listing + verified badge</div>
        <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
          {[
            { plan:'basic', price:'Free',       features:['Listed in search','Standard ranking'],                missing:['Verified badge','Priority listing','Surge access'] },
            { plan:'pro',   price:'₹999/mo',    features:['Priority listing','Verified badge','Analytics'],      missing:['Top 3 placement','Dedicated support'] },
            { plan:'elite', price:'₹1,999/mo',  features:['Top 3 placement','Verified badge','Analytics','Dedicated support','Surge pricing access'], missing:[] },
          ].map(({ plan,price,features,missing }) => {
            const active = provider.plan === plan;
            return (
              <div key={plan} className={`plan${active?' active':''}`} onClick={() => !active && upgradePlan(plan)} style={{ cursor:active?'default':'pointer' }}>
                <div className="flex jsb aic mb2">
                  <div className="flex aic gap2">
                    <span className="bold sm" style={{ textTransform:'capitalize' }}>{plan}</span>
                    {active && <span className="badge badge-blue">Current</span>}
                  </div>
                  <span className="plan-price">{price}</span>
                </div>
                {features.map(f => <div key={f} className="plan-feat"><span style={{ color:'var(--green)' }}>✓</span>{f}</div>)}
                {missing.map(f  => <div key={f} className="plan-feat" style={{ color:'var(--border)' }}><span>✕</span>{f}</div>)}
                {!active && (
                  <button className="btn btn-primary btn-full btn-sm mt2">Switch to {plan.charAt(0).toUpperCase()+plan.slice(1)}</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
