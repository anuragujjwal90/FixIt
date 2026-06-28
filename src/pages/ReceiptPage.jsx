import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context';

export default function ReceiptPage() {
  const { state }    = useLocation();
  const navigate     = useNavigate();
  const { myBookings } = useStore();

  const bookingId = state?.bookingId;
  const booking   = myBookings.find(b => b.id === bookingId) || myBookings.find(b => b.status === 'completed');

  const download = () => {
    if (!booking) return;
    const svcs = Array.isArray(booking.services) ? booking.services : [];
    const cgst = Math.round((booking.gst || 0) / 2);
    const lines = [
      '============================================================',
      '                   ServeEasy Tax Invoice',
      '============================================================',
      `Invoice No  : ${booking.invoiceNo}`,
      `GSTIN       : 09ABCDE1234F1Z5`,
      `Date        : ${booking.date}`,
      `Booking Ref : ${booking.ref}`,
      '------------------------------------------------------------',
      `Provider    : ${booking.providerName}`,
      `Category    : ${booking.category}`,
      `Scheduled   : ${booking.date} at ${booking.time}`,
      `Address     : ${booking.address}`,
      '------------------------------------------------------------',
      'Services:',
      ...svcs.map(s => `  ${s.name.padEnd(32)} ₹${s.price}`),
      '------------------------------------------------------------',
      `Subtotal    : ₹${booking.subtotal || 0}`,
      booking.surgeFee ? `Surge Fee   : ₹${booking.surgeFee}` : null,
      `Conv. Fee   : ₹${booking.convFee || 0}`,
      `CGST (9%)   : ₹${cgst}`,
      `SGST (9%)   : ₹${cgst}`,
      `TOTAL PAID  : ₹${booking.total || 0}`,
      '------------------------------------------------------------',
      `Payment     : ${(booking.paymentMethod || 'card').toUpperCase()}`,
      '============================================================',
      '    Thank you for choosing ServeEasy!',
      '    support@serveeasy.in',
      '============================================================',
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${booking.invoiceNo || 'invoice'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!booking) {
    return (
      <div className="page-sm tc" style={{ paddingTop:60 }}>
        <div style={{ fontSize:40,marginBottom:12 }}>🧾</div>
        <p className="muted mb3">No completed bookings yet.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Book a Service</button>
      </div>
    );
  }

  const svcs = Array.isArray(booking.services) ? booking.services : [];
  const cgst = Math.round((booking.gst || 0) / 2);

  return (
    <div className="page-sm">
      <div className="sec-title mb1">Receipts &amp; Invoices</div>
      <div className="sec-sub mb3">GST-compliant tax invoice</div>

      <div style={{ border:'1px solid var(--border)', borderRadius:'var(--rxl)', overflow:'hidden' }}>
        {/* Header */}
        <div className="receipt-head">
          <div style={{ width:52,height:52,background:'rgba(255,255,255,.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:24 }}>✅</div>
          <div style={{ fontFamily:'var(--font-d)',fontSize:20,fontWeight:800,marginBottom:4 }}>Service Completed</div>
          <div style={{ fontSize:12,opacity:.8 }}>Payment confirmed · #{booking.ref}</div>
        </div>

        {/* Body */}
        <div style={{ padding:'20px 24px' }}>
          <div className="flex aic gap2 mb1">
            <span className="badge badge-blue">🧾 GST Invoice</span>
            <span className="xs muted">{booking.invoiceNo}</span>
          </div>
          <div className="xs muted mb3">GSTIN: 09ABCDE1234F1Z5 · {booking.date}</div>

          {[['Provider',booking.providerName],['Category',booking.category],['Scheduled',`${booking.date} · ${booking.time}`],['Address',booking.address]].map(([k,v]) => (
            <div key={k} className="flex jsb" style={{ fontSize:13,padding:'6px 0',borderBottom:'1px solid var(--surface)' }}>
              <span className="muted">{k}</span>
              <span className="bold" style={{ maxWidth:'60%',textAlign:'right' }}>{v || '—'}</span>
            </div>
          ))}

          <div className="divider" />

          {svcs.map((s,i) => (
            <div key={i} className="flex jsb" style={{ fontSize:13,marginBottom:6,color:'var(--ink2)' }}>
              <span>{s.name}</span><span>₹{s.price}</span>
            </div>
          ))}

          <div className="divider" />

          {[
            ['Subtotal',         `₹${booking.subtotal || 0}`,  false],
            booking.surgeFee ? ['⚡ Surge fee', `₹${booking.surgeFee}`, false] : null,
            ['Convenience fee',  `₹${booking.convFee || 0}`,   false],
            [`CGST (9%)`,        `₹${cgst}`,                   false],
            [`SGST (9%)`,        `₹${cgst}`,                   false],
          ].filter(Boolean).map(([k,v]) => (
            <div key={k} className="flex jsb" style={{ fontSize:12,marginBottom:5,color:'var(--ink3)' }}>
              <span>{k}</span><span>{v}</span>
            </div>
          ))}

          <div className="flex jsb bold" style={{ fontSize:17,borderTop:'2px solid var(--border)',paddingTop:12,marginTop:6 }}>
            <span>Total Paid</span>
            <span style={{ color:'var(--blue)' }}>₹{booking.total || 0}</span>
          </div>

          {booking.paymentType === 'deposit' && (
            <div style={{ background:'var(--green-lt)',border:'1px solid #86EFAC',borderRadius:'var(--r)',padding:'9px 12px',marginTop:12,fontSize:12,color:'var(--green)' }}>
              ✓ Deposit ₹{booking.deposit} paid · Balance ₹{booking.total - booking.deposit} charged on completion
            </div>
          )}

          <div className="xs muted mt2">
            💳 Paid via {(booking.paymentMethod || 'card').toUpperCase()} ·{' '}
            <span style={{ color:'var(--green)',fontWeight:600,textTransform:'capitalize' }}>{(booking.paymentStatus||'paid').replace(/_/g,' ')}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'13px 22px',background:'var(--surface)',display:'flex',gap:9,borderTop:'1px solid var(--border)',flexWrap:'wrap' }}>
          <button className="btn btn-primary btn-sm f1" onClick={download}>⬇ Download Invoice</button>
          <button className="btn btn-outline btn-sm f1" onClick={() => window.print()}>🖨 Print</button>
          <button className="btn btn-outline btn-sm f1" onClick={() => navigate('/history')}>← Bookings</button>
        </div>
      </div>
    </div>
  );
}
