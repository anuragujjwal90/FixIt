import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const { user, profile, logout } = useAuth();
  const toast    = useToast();
  const navigate = useNavigate();

  const [name,    setName]    = useState(profile?.name || '');
  const [phone,   setPhone]   = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [saving,  setSaving]  = useState(false);
  const [pwForm,  setPwForm]  = useState({ current: '', next: '', confirm: '' });
  const [pwSaving,setPwSaving]= useState(false);
  const [notif,   setNotif]   = useState({ email: true, sms: true, push: false });

  const saveProfile = async () => {
    setSaving(true);
    try {
      await supabase.from('profiles').update({ name, phone, address }).eq('id', user.id);
      toast('Profile saved!', 'success');
    } catch { toast('Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    if (pwForm.next.length < 6)         { toast('Min 6 characters', 'warning'); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.next });
      if (error) throw error;
      toast('Password updated!', 'success');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) { toast(e.message || 'Failed', 'error'); }
    finally { setPwSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="se-page-narrow">
      <div className="se-section-title" style={{ marginBottom: 4 }}>Settings</div>
      <div className="se-section-sub" style={{ marginBottom: 24 }}>Manage your account preferences</div>

      {/* Account info */}
      <div className="se-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>👤 Account Details</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', marginBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div className="se-avatar" style={{ width: 52, height: 52, background: 'var(--blue-lt)', color: 'var(--blue)', fontSize: 18 }}>
            {(profile?.name || user?.email || '?').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.name || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{user?.email}</div>
            <span className="se-badge se-badge-blue" style={{ marginTop: 4, display: 'inline-block', textTransform: 'capitalize' }}>{profile?.role}</span>
          </div>
        </div>

        <div className="se-field">
          <label className="se-label">Full Name</label>
          <input className="se-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="se-field">
          <label className="se-label">Phone</label>
          <input className="se-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="se-field" style={{ marginBottom: 0 }}>
          <label className="se-label">Address</label>
          <input className="se-input" placeholder="Your home address" value={address} onChange={e => setAddress(e.target.value)} />
        </div>
        <button className="se-btn se-btn-primary se-btn-full" style={{ marginTop: 16 }} onClick={saveProfile} disabled={saving}>
          {saving ? <><span className="se-spinner" style={{ width: 14, height: 14 }} /> Saving…</> : '💾 Save Changes'}
        </button>
      </div>

      {/* Password */}
      <div className="se-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🔒 Change Password</div>
        {[['current','Current Password'],['next','New Password'],['confirm','Confirm New Password']].map(([k, l]) => (
          <div key={k} className="se-field">
            <label className="se-label">{l}</label>
            <input className="se-input" type="password" placeholder="••••••" value={pwForm[k]} onChange={e => setPwForm(f => ({ ...f, [k]: e.target.value }))} />
          </div>
        ))}
        <button className="se-btn se-btn-primary se-btn-full" onClick={changePassword} disabled={pwSaving}>
          {pwSaving ? <><span className="se-spinner" style={{ width: 14, height: 14 }} /> Updating…</> : '🔑 Update Password'}
        </button>
      </div>

      {/* Notifications */}
      <div className="se-card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>🔔 Notifications</div>
        {[['email','Email notifications'],['sms','SMS alerts'],['push','Push notifications']].map(([k, l]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--surface)' }}>
            <span style={{ fontSize: 13 }}>{l}</span>
            <label className="se-toggle">
              <input type="checkbox" checked={notif[k]} onChange={() => { setNotif(n => ({ ...n, [k]: !n[k] })); toast(`${l} ${!notif[k] ? 'enabled' : 'disabled'}`, 'info'); }} />
              <div className="se-toggle-track" />
            </label>
          </div>
        ))}
      </div>

      {/* Danger zone */}
      <div className="se-card" style={{ borderColor: 'var(--red-lt)' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: 'var(--red)' }}>⚠️ Danger Zone</div>
        <button className="se-btn se-btn-danger se-btn-full" onClick={handleLogout}>🚪 Sign Out</button>
        <button className="se-btn se-btn-outline se-btn-full" style={{ marginTop: 10, borderColor: 'var(--red)', color: 'var(--red)' }}
          onClick={() => toast('Please contact support@serveeasy.in to delete your account', 'info')}>
          🗑 Delete Account
        </button>
      </div>
    </div>
  );
}
