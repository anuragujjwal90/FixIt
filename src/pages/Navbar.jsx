import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { useToast } from '../context';

export default function Navbar() {
  const { user, logout, isProvider } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const at = p => pathname === p;

  const customerLinks = [
    { to:'/',        label:'🏠 Home' },
    { to:'/booking', label:'📅 Book' },
    { to:'/track',   label:'📍 Track' },
    { to:'/history', label:'⭐ History' },
  ];
  const providerLinks = [
    { to:'/dashboard',  label:'📊 Dashboard' },
    { to:'/jobs',       label:'💼 Jobs' },
    { to:'/onboarding', label:'🆔 Profile' },
  ];
  const links = isProvider ? providerLinks : customerLinks;

  const doLogout = () => { logout(); toast('Signed out', 'info'); navigate('/'); setOpen(false); };

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate(isProvider ? '/dashboard' : '/')}>🔧 FixIt</div>

      <div className="flex gap2" style={{ flex: 1, justifyContent: 'center' }}>
        {links.map(l => (
          <button key={l.to} className={`nav-btn${at(l.to) ? ' active' : ''}`} onClick={() => navigate(l.to)}>
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex aic gap2" style={{ position: 'relative' }}>
        {user ? (
          <>
            <div
              className="ava"
              style={{ width:34, height:34, background:'var(--blue-lt)', color:'var(--blue)', fontSize:12, cursor:'pointer' }}
              onClick={() => setOpen(o => !o)}
            >
              {(user.name || user.email).slice(0,2).toUpperCase()}
            </div>

            {open && (
              <>
                <div style={{ position:'fixed', inset:0, zIndex:199 }} onClick={() => setOpen(false)} />
                <div className="dropdown">
                  <div style={{ padding:'7px 12px', fontSize:11, color:'var(--ink3)', borderBottom:'1px solid var(--border)', marginBottom:3 }}>
                    {isProvider ? '🔧 Provider' : '👤 Customer'} · {user.name}
                  </div>
                  {!isProvider && (
                    <>
                      <button className="dd-item" onClick={() => { navigate('/history'); setOpen(false); }}>📋 My Bookings</button>
                      <button className="dd-item" onClick={() => { navigate('/receipt'); setOpen(false); }}>🧾 Receipts</button>
                    </>
                  )}
                  {isProvider && (
                    <button className="dd-item" onClick={() => { navigate('/dashboard'); setOpen(false); }}>💰 Earnings</button>
                  )}
                  <div style={{ borderTop:'1px solid var(--border)', marginTop:4, paddingTop:4 }}>
                    <button className="dd-item" style={{ color:'var(--red)' }} onClick={doLogout}>🚪 Sign Out</button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
