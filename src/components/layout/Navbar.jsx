import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar() {
  const { user, profile, logout, isProvider } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const at = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    toast('Signed out', 'info');
    navigate('/auth');
  };

  const customerLinks = [
    { path: '/',          label: '🏠 Home' },
    { path: '/booking',   label: '📅 Book' },
    { path: '/track',     label: '📍 Track' },
    { path: '/history',   label: '⭐ History' },
  ];
  const providerLinks = [
    { path: '/dashboard', label: '📊 Dashboard' },
    { path: '/jobs',      label: '💼 My Jobs' },
    { path: '/onboarding',label: '🆔 Profile' },
  ];
  const links = isProvider ? providerLinks : customerLinks;

  return (
    <nav className="se-nav">
      <div className="se-nav-logo" onClick={()=>navigate('/')} style={{cursor:'pointer'}}>
        🔧 <span>ServeEasy</span>
      </div>

      {/* Desktop links */}
      <div className="se-nav-links" style={{flex:1, justifyContent:'center'}}>
        {links.map(l => (
          <button key={l.path} className={`se-nav-btn${at(l.path)?' active':''}`} onClick={()=>navigate(l.path)}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Right side */}
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        {user ? (
          <>
            <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>setMenuOpen(!menuOpen)}>
              <div className="se-avatar" style={{width:34,height:34,background:'var(--blue-lt)',color:'var(--blue)',fontSize:12}}>
                {(profile?.name || user.email || '?').slice(0,2).toUpperCase()}
              </div>
              <span className="se-hide-mob" style={{fontSize:13,fontWeight:600,color:'var(--ink-2)'}}>{profile?.name || user.email}</span>
              <span style={{fontSize:10,color:'var(--ink-4)'}}>▼</span>
            </div>
            {menuOpen && (
              <div style={{position:'absolute',top:60,right:24,background:'var(--white)',border:'1px solid var(--border)',borderRadius:'var(--r-lg)',padding:8,minWidth:180,boxShadow:'var(--shadow)',zIndex:200}}>
                <div style={{padding:'8px 12px',fontSize:12,color:'var(--ink-3)',borderBottom:'1px solid var(--border)',marginBottom:4}}>
                  {profile?.role === 'provider' ? '🔧 Provider' : '👤 Customer'}
                </div>
                {!isProvider && <MenuRow label="📋 My Bookings" onClick={()=>{navigate('/history');setMenuOpen(false);}} />}
                {!isProvider && <MenuRow label="🧾 Receipts" onClick={()=>{navigate('/receipts');setMenuOpen(false);}} />}
                {isProvider && <MenuRow label="💰 Earnings" onClick={()=>{navigate('/dashboard');setMenuOpen(false);}} />}
                <MenuRow label="⚙️ Settings" onClick={()=>{navigate('/settings');setMenuOpen(false);}} />
                <div style={{borderTop:'1px solid var(--border)',marginTop:4,paddingTop:4}}>
                  <MenuRow label="🚪 Sign Out" onClick={handleLogout} danger />
                </div>
              </div>
            )}
          </>
        ) : (
          <button className="se-btn se-btn-primary se-btn-sm" onClick={()=>navigate('/auth')}>Sign In</button>
        )}
      </div>
    </nav>
  );
}

function MenuRow({label, onClick, danger}) {
  return (
    <button onClick={onClick} style={{display:'block',width:'100%',textAlign:'left',padding:'8px 12px',border:'none',background:'none',cursor:'pointer',fontSize:13,color:danger?'var(--red)':'var(--ink)',borderRadius:'var(--r)',fontFamily:'inherit'}}>
      {label}
    </button>
  );
}
