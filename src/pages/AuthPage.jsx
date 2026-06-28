import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { useToast } from '../context';

const CATS = ['Electrical','Plumbing','Cleaning','Carpentry','Painting','AC Repair','Pest Control','Locksmith','Appliances'];

export default function AuthPage() {
  const { login, register } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [mode,    setMode]    = useState('login');
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  // Controlled fields — all in one object, never re-created
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirm,     setConfirm]     = useState('');
  const [phone,       setPhone]       = useState('');
  const [category,    setCategory]    = useState('Electrical');
  const [title,       setTitle]       = useState('');
  const [experience,  setExperience]  = useState('1');
  const [bio,         setBio]         = useState('');

  const switchMode = (m) => { setMode(m); setErrors({}); };

  const validate = () => {
    const e = {};
    if (mode !== 'login' && !name.trim())          e.name     = 'Name is required';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email  = 'Valid email required';
    if (password.length < 6)                        e.password = 'At least 6 characters';
    if (mode !== 'login' && password !== confirm)   e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const u = login(email, password);
        toast('Welcome back, ' + u.name + '! 👋', 'success');
        navigate(u.role === 'provider' ? '/dashboard' : '/');
      } else {
        const fields = { name, email, password, phone, category, title, experience, bio };
        const isProvider = mode === 'pro';
        const u = register(fields, isProvider);
        toast('Account created! Welcome ' + u.name, 'success');
        navigate(isProvider ? '/dashboard' : '/');
      }
    } catch (err) {
      toast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        {/* Logo */}
        <div style={{ fontFamily:'var(--font-d)', fontSize:22, fontWeight:800, color:'var(--blue)', marginBottom:22, display:'flex', alignItems:'center', gap:7 }}>
          🔧 ServeEasy
        </div>

        {/* Mode tabs */}
        <div style={{ display:'flex', background:'var(--surface)', borderRadius:'var(--r)', padding:3, marginBottom:22 }}>
          {[['login','Sign In'],['register','Customer'],['pro','Provider']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              style={{
                flex:1, padding:'8px 4px', borderRadius:'var(--r)', border:'none', cursor:'pointer',
                background: mode===m ? 'var(--white)' : 'transparent',
                color: mode===m ? 'var(--blue)' : 'var(--ink3)',
                fontWeight: mode===m ? 700 : 500, fontSize:12,
                boxShadow: mode===m ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                transition:'all .15s', fontFamily:'var(--font)',
              }}
            >{label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Name — only for register */}
          {mode !== 'login' && (
            <div className="field">
              <label className="label">Full Name</label>
              <input className={`input${errors.name?' input-err':''}`} placeholder="Amit Gupta" value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <div className="err-msg">{errors.name}</div>}
            </div>
          )}

          {/* Email */}
          <div className="field">
            <label className="label">Email</label>
            <input className={`input${errors.email?' input-err':''}`} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            {errors.email && <div className="err-msg">{errors.email}</div>}
          </div>

          {/* Password */}
          <div className="field">
            <label className="label">Password</label>
            <input className={`input${errors.password?' input-err':''}`} type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            {errors.password && <div className="err-msg">{errors.password}</div>}
          </div>

          {/* Confirm password — register only */}
          {mode !== 'login' && (
            <div className="field">
              <label className="label">Confirm Password</label>
              <input className={`input${errors.confirm?' input-err':''}`} type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              {errors.confirm && <div className="err-msg">{errors.confirm}</div>}
            </div>
          )}

          {/* Phone — register only */}
          {mode !== 'login' && (
            <div className="field">
              <label className="label">Phone (optional)</label>
              <input className="input" type="tel" placeholder="+91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
          )}

          {/* Provider extra fields */}
          {mode === 'pro' && (
            <>
              <div className="divider" />
              <p style={{ fontSize:11, color:'var(--ink3)', marginBottom:14 }}>📋 Provider details</p>
              <div className="field">
                <label className="label">Service Category</label>
                <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                  {CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Professional Title</label>
                <input className="input" placeholder="e.g. Master Electrician" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Years of Experience</label>
                <input className="input" type="number" min="0" placeholder="3" value={experience} onChange={e => setExperience(e.target.value)} />
              </div>
              <div className="field">
                <label className="label">Bio (optional)</label>
                <textarea className="input" rows={3} placeholder="Tell customers about your expertise..." value={bio} onChange={e => setBio(e.target.value)} style={{ resize:'vertical' }} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop:4 }}>
            {loading
              ? <><span className="spin" /> Working...</>
              : mode === 'login' ? 'Sign In' : 'Create Account'
            }
          </button>
        </form>

        {/* Demo hint */}
        {mode === 'login' && (
          <div style={{ fontSize:11, color:'var(--ink3)', textAlign:'center', marginTop:16, lineHeight:1.8 }}>
            Demo customer: <strong>amit@demo.com</strong> / <strong>demo123</strong><br />
            Demo provider: <strong>rajesh@demo.com</strong> / <strong>demo123</strong>
          </div>
        )}

        {mode !== 'login' && (
          <p style={{ fontSize:11, color:'var(--ink3)', textAlign:'center', marginTop:14 }}>
            Already have an account?{' '}
            <button type="button" onClick={() => switchMode('login')} style={{ background:'none', border:'none', color:'var(--blue)', fontWeight:600, cursor:'pointer', fontSize:11 }}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
