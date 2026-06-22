const CATEGORIES = [
  {icon:'ti-droplet',name:'Plumbing'},
  {icon:'ti-bolt',name:'Electrical'},
  {icon:'ti-home-clean',name:'Cleaning'},
  {icon:'ti-hammer',name:'Carpentry'},
  {icon:'ti-paint',name:'Painting'},
  {icon:'ti-air-conditioning',name:'AC Repair'},
  {icon:'ti-bug-off',name:'Pest Control'},
  {icon:'ti-lock',name:'Locksmith'},
  {icon:'ti-washing-machine',name:'Appliances'},
  {icon:'ti-garden-cart',name:'Gardening'},
  {icon:'ti-camera',name:'CCTV Install'},
  {icon:'ti-package',name:'Moving'},
];

const PROVIDERS = [
  {id:1,name:'Rajesh Kumar',title:'Master Electrician',cat:'Electrical',avail:'now',rating:4.9,reviews:342,jobs:520,exp:'8 yrs',min:300,max:900,dist:1.2,verified:true,surge:false,avatar:'RK',avatarBg:'#EEF2FF',avatarColor:'#3730A3'},
  {id:2,name:'Sunita Devi',title:'Professional Cleaner',cat:'Cleaning',avail:'now',rating:4.8,reviews:210,jobs:380,exp:'5 yrs',min:250,max:700,dist:2.4,verified:true,surge:true,avatar:'SD',avatarBg:'#F0FDF4',avatarColor:'#166534'},
  {id:3,name:'Mohan Lal',title:'Licensed Plumber',cat:'Plumbing',avail:'1hr',rating:4.7,reviews:189,jobs:295,exp:'10 yrs',min:200,max:800,dist:3.1,verified:true,surge:false,avatar:'ML',avatarBg:'#FEF3C7',avatarColor:'#92400E'},
  {id:4,name:'Priya Sharma',title:'Interior Painter',cat:'Painting',avail:'now',rating:4.6,reviews:97,jobs:145,exp:'4 yrs',min:400,max:1200,dist:4.0,verified:false,surge:false,avatar:'PS',avatarBg:'#FDF2F8',avatarColor:'#9D174D'},
  {id:5,name:'Arjun Singh',title:'AC Technician',cat:'AC Repair',avail:'busy',rating:4.9,reviews:278,jobs:410,exp:'7 yrs',min:350,max:1500,dist:2.8,verified:true,surge:true,avatar:'AS',avatarBg:'#EFF6FF',avatarColor:'#1E40AF'},
  {id:6,name:'Deepak Yadav',title:'Carpenter & Furniture Expert',cat:'Carpentry',avail:'now',rating:4.5,reviews:134,jobs:205,exp:'6 yrs',min:300,max:1000,dist:5.5,verified:true,surge:false,avatar:'DY',avatarBg:'#FFF7ED',avatarColor:'#9A3412'},
];

const HISTORY = [
  {provider:'Rajesh Kumar',service:'Fan Installation',date:'18 Jun 2026',amount:'₹850',rating:5,review:'Excellent work! Very professional and on time. Fixed 2 fans and checked all wiring. Highly recommended.',cat:'Electrical'},
  {provider:'Sunita Devi',service:'Deep Home Cleaning',date:'12 Jun 2026',amount:'₹1,200',rating:5,review:'Did an amazing job. Very thorough with the kitchen and bathrooms. Will book again!',cat:'Cleaning'},
  {provider:'Mohan Lal',service:'Pipe Leak Repair',date:'5 Jun 2026',amount:'₹650',rating:4,review:'Good work, fixed the leak quickly. Slightly late but informed beforehand.',cat:'Plumbing'},
  {provider:'Arjun Singh',service:'AC Service + Gas Refill',date:'28 May 2026',amount:'₹2,100',rating:5,review:'Brilliant service! AC is running much better now. Very knowledgeable technician.',cat:'AC Repair'},
];

const JOB_QUEUE = [
  {customer:'Amit G.',service:'Switch Replacement',time:'11:30 AM',status:'pending'},
  {customer:'Kavya M.',service:'Wiring Repair',time:'2:00 PM',status:'accepted'},
  {customer:'Ravi S.',service:'Fan Installation',time:'4:30 PM',status:'accepted'},
  {customer:'Neha P.',service:'Inverter Setup',time:'Tmrw 9AM',status:'pending'},
];

let currentStep = 1;
let selectedServices = [];
let selectedSlot = '';
let paymentMethod = 'full';
let currentFilter = 'all';
let activeView = 'home';

function switchView(v){
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(el=>el.classList.remove('active'));
  document.getElementById('view-'+v).classList.add('active');
  const nb=document.getElementById('nav-'+v);
  if(nb)nb.classList.add('active');
  activeView=v;
  if(v==='dashboard')renderDashboard();
  if(v==='history')renderHistory();
}

function showReceipt(){switchView('receipt')}

// CATEGORIES
function renderCategories(){
  const g=document.getElementById('cats-grid');
  g.innerHTML=CATEGORIES.map((c,i)=>`
    <div class="cat-card" onclick="filterByCat('${c.name}',this)">
      <i class="ti ${c.icon}"></i><span>${c.name}</span>
    </div>`).join('');
}

function filterByCat(name,el){
  document.querySelectorAll('.cat-card').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  const filtered=PROVIDERS.filter(p=>p.cat===name);
  renderProviders(filtered.length?filtered:PROVIDERS);
  document.getElementById('providers-heading').textContent=name+' Professionals';
  document.getElementById('providers-sub').textContent=`${filtered.length} providers in Lucknow`;
}

function searchProviders(){
  const cat=document.getElementById('cat-filter').value;
  if(cat==='All services')renderProviders(PROVIDERS);
  else filterByCat(cat,{classList:{add:()=>{},remove:()=>{}}});
  showToast('Showing providers near Lucknow','success');
}

function setFilter(f,el){
  document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  currentFilter=f;
  let arr=[...PROVIDERS];
  if(f==='available')arr=arr.filter(p=>p.avail==='now');
  if(f==='top')arr=arr.sort((a,b)=>b.rating-a.rating);
  if(f==='nearby')arr=arr.filter(p=>p.dist<=4);
  if(f==='budget')arr=arr.sort((a,b)=>a.min-b.min);
  if(f==='verified')arr=arr.filter(p=>p.verified);
  renderProviders(arr);
}

function renderProviders(list){
  const g=document.getElementById('providers-grid');
  g.innerHTML=list.map(p=>`
    <div class="provider-card" onclick="openBooking(${p.id})">
      <div class="pcard-header">
        <div class="avatar" style="background:${p.avatarBg};color:${p.avatarColor}">${p.avatar}</div>
        <div class="pcard-info">
          <div class="pcard-name">${p.name}</div>
          <div class="pcard-title">${p.title} · ${p.exp} exp</div>
          <div class="badge-row">
            ${p.verified?'<span class="badge badge-verified">✓ Verified Pro</span>':''}
            <span class="badge ${p.avail==='now'?'badge-avail':p.avail==='busy'?'badge-busy':'badge-surge'}">${p.avail==='now'?'● Available Now':p.avail==='busy'?'● Busy':'⏱ '+p.avail}</span>
            ${p.surge?'<span class="badge badge-surge">⚡ Surge +20%</span>':''}
          </div>
        </div>
      </div>
      <div class="pcard-body">
        <div class="rating-row">
          <span class="stars">★★★★${p.rating>=4.9?'★':'☆'}</span>
          <span class="rating-val">${p.rating}</span>
          <span class="rating-count">(${p.reviews} reviews)</span>
        </div>
        <div class="pcard-stats">
          <div class="stat-item"><div class="stat-val">${p.jobs}+</div><div class="stat-lbl">Jobs Done</div></div>
          <div class="stat-item"><div class="stat-val">${p.dist}km</div><div class="stat-lbl">From You</div></div>
        </div>
        <div class="pcard-price">
          <div><div class="price-range">₹${p.min}–₹${p.max}</div><div class="price-lbl">per service</div></div>
          <button class="book-btn" onclick="event.stopPropagation();openBooking(${p.id})">Book Now</button>
        </div>
      </div>
    </div>`).join('');
}

// BOOKING FLOW
let bookingProvider=null;
function openBooking(id){
  bookingProvider=PROVIDERS.find(p=>p.id===id);
  currentStep=1;
  selectedServices=[];
  selectedSlot='';
  switchView('booking');
  renderBookingStep();
}

const SERVICES_MAP={
  'Electrical':[{name:'Fan Installation',price:250},{name:'Switch/Socket Repair',price:150},{name:'Wiring Check',price:200},{name:'MCB/Fuse Replacement',price:180},{name:'New Connection',price:400}],
  'Cleaning':[{name:'Basic Home Cleaning',price:400},{name:'Deep Cleaning',price:800},{name:'Kitchen Deep Clean',price:500},{name:'Bathroom Sanitisation',price:300},{name:'Post-Construction Clean',price:1200}],
  'Plumbing':[{name:'Pipe Leak Repair',price:300},{name:'Tap Replacement',price:200},{name:'Drain Unclogging',price:250},{name:'Water Heater Install',price:500},{name:'Toilet Repair',price:350}],
  'Painting':[{name:'1 Room (100 sqft)',price:800},{name:'Full Home (1BHK)',price:4500},{name:'Exterior Wall',price:2000},{name:'Touch-up Painting',price:400},{name:'Waterproofing',price:1500}],
  'AC Repair':[{name:'AC Service & Clean',price:600},{name:'Gas Refill (1 ton)',price:800},{name:'PCB Repair',price:1200},{name:'AC Installation',price:1500},{name:'Drain Pipe Clean',price:300}],
  'Carpentry':[{name:'Door/Window Repair',price:350},{name:'Furniture Assembly',price:400},{name:'Wardrobe Fitting',price:800},{name:'Custom Shelf',price:600},{name:'Laminate Work',price:500}],
};

function renderBookingStep(){
  ['s1','s2','s3','s4','s5'].forEach((id,i)=>{
    const el=document.getElementById(id);
    el.className='step-circle'+(i+1<currentStep?' done':i+1===currentStep?' current':'');
    el.parentElement.querySelector('.step-lbl').className='step-lbl'+(i+1===currentStep?' current':'');
  });

  const services=SERVICES_MAP[bookingProvider.cat]||SERVICES_MAP['Electrical'];
  const total=selectedServices.reduce((s,sv)=>s+sv.price,0);
  const surge=bookingProvider.surge?Math.round(total*0.2):0;
  const convFee=total>0?50:0;
  const subtotal=total+surge+convFee;
  const gst=Math.round(subtotal*0.18);
  const grand=subtotal+gst;
  const deposit=Math.round(grand*0.3);

  const c=document.getElementById('booking-content');
  if(currentStep===1){
    c.innerHTML=`
      <div class="booking-card">
        <h3><i class="ti ti-tools"></i> Select Services</h3>
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px">
          <div class="avatar" style="background:${bookingProvider.avatarBg};color:${bookingProvider.avatarColor};width:40px;height:40px;font-size:13px">${bookingProvider.avatar}</div>
          <div><div class="font-semibold">${bookingProvider.name}</div><div class="text-xs text-muted">${bookingProvider.title} · ${bookingProvider.rating}★</div></div>
          ${bookingProvider.surge?'<span class="badge badge-surge" style="margin-left:auto">⚡ Surge pricing active</span>':''}
        </div>
        ${bookingProvider.surge?'<div class="surge-banner"><i class="ti ti-alert-triangle"></i> High demand in your area. Surge pricing of +20% applied transparently.</div>':''}
        <div class="services-list">
          ${services.map((s,i)=>`
            <div class="service-item" onclick="toggleService(${i},'${s.name}',${s.price})" id="svc-${i}">
              <input type="checkbox" id="chk-${i}">
              <span class="service-name">${s.name}</span>
              <span class="service-price">₹${s.price}</span>
            </div>`).join('')}
        </div>
        ${total>0?`
        <div class="price-breakdown">
          ${selectedServices.map(s=>`<div class="price-line"><span>${s.name}</span><span>₹${s.price}</span></div>`).join('')}
          ${surge?`<div class="price-line" style="color:var(--warning)"><span>⚡ Surge (20%)</span><span>+₹${surge}</span></div>`:''}
          <div class="price-line"><span>Convenience fee</span><span>₹${convFee}</span></div>
          <div class="price-line"><span>GST (18%)</span><span>₹${gst}</span></div>
          <div class="price-line total"><span>Estimated Total</span><span>₹${grand}</span></div>
        </div>`:'<div style="text-align:center;color:var(--gray-400);font-size:13px;padding:16px">Select services to see price estimate</div>'}
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline flex-1" onclick="switchView('home')">Cancel</button>
        <button class="btn btn-primary flex-1" onclick="nextStep()" ${selectedServices.length===0?'disabled style="opacity:.5"':''}>Continue <i class="ti ti-arrow-right"></i></button>
      </div>`;
  }
  else if(currentStep===2){
    const slots=['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
    const unavail=['10:00 AM','3:00 PM'];
    c.innerHTML=`
      <div class="booking-card">
        <h3><i class="ti ti-calendar"></i> Schedule Appointment</h3>
        <div class="form-row"><label>Date</label><input type="date" id="book-date" value="${new Date().toISOString().split('T')[0]}"></div>
        <div class="form-row"><label>Available Slots</label>
          <div class="time-grid">
            ${slots.map(s=>`<div class="time-slot${unavail.includes(s)?' unavail':selectedSlot===s?' selected':''}" onclick="${unavail.includes(s)?'':'selectSlot(\''+s+'\',this)'}">${s}${unavail.includes(s)?'<br><span style="font-size:9px">Booked</span>':''}</div>`).join('')}
          </div>
        </div>
        <div class="form-row mt-3"><label>Booking Type</label>
          <select><option>One-time visit</option><option>Weekly subscription (–15%)</option><option>Monthly subscription (–25%)</option></select>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline flex-1" onclick="prevStep()"><i class="ti ti-arrow-left"></i> Back</button>
        <button class="btn btn-primary flex-1" onclick="nextStep()" ${!selectedSlot?'disabled style="opacity:.5"':''}>Continue <i class="ti ti-arrow-right"></i></button>
      </div>`;
  }
  else if(currentStep===3){
    c.innerHTML=`
      <div class="booking-card">
        <h3><i class="ti ti-map-pin"></i> Service Address</h3>
        <div class="form-row"><label>Full Address</label><textarea rows="2" placeholder="House No., Street, Colony...">12, Rajendra Nagar, Gomti Nagar</textarea></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div class="form-row"><label>City</label><input type="text" value="Lucknow"></div>
          <div class="form-row"><label>PIN Code</label><input type="text" value="226010"></div>
        </div>
        <div class="form-row"><label>Landmark</label><input type="text" placeholder="Near Metro / Mall etc."></div>
        <div class="form-row"><label>Special Instructions</label><textarea rows="2" placeholder="Gate code, floor number, parking notes..."></textarea></div>
        <div style="background:var(--gray-50);border-radius:var(--radius);padding:12px;display:flex;align-items:center;gap:10px">
          <i class="ti ti-map" style="color:var(--primary);font-size:20px"></i>
          <div><div class="font-semibold text-sm">Detect my location</div><div class="text-xs text-muted">Use GPS for precise address</div></div>
          <button class="btn btn-outline btn-sm" style="margin-left:auto" onclick="showToast('Location detected: Gomti Nagar','success')">Use GPS</button>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline flex-1" onclick="prevStep()"><i class="ti ti-arrow-left"></i> Back</button>
        <button class="btn btn-primary flex-1" onclick="nextStep()">Continue <i class="ti ti-arrow-right"></i></button>
      </div>`;
  }
  else if(currentStep===4){
    c.innerHTML=`
      <div class="booking-card">
        <h3><i class="ti ti-credit-card"></i> Payment</h3>
        <div class="deposit-info">
          <i class="ti ti-info-circle"></i> <strong>Split Payment Available:</strong> Pay ₹${deposit} now (30% deposit) and ₹${grand-deposit} on service completion.
        </div>
        <div class="payment-tabs">
          <button class="pay-tab active" onclick="setPayment('full',this)">Pay Full (₹${grand})</button>
          <button class="pay-tab" onclick="setPayment('deposit',this)">Deposit Only (₹${deposit})</button>
        </div>
        <div id="pay-detail">
          <div class="form-row"><label>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" maxlength="19"></div>
          <div class="card-input-row">
            <div class="form-row"><label>Expiry</label><input type="text" placeholder="MM / YY"></div>
            <div class="form-row"><label>CVV</label><input type="text" placeholder="•••" maxlength="3"></div>
          </div>
          <div class="form-row"><label>Name on Card</label><input type="text" placeholder="Amit Gupta"></div>
          <div class="divider"></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="showToast('UPI: Enter UPI ID to pay','')"><i class="ti ti-device-mobile"></i> UPI</button>
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="showToast('Net Banking selected','')"><i class="ti ti-building-bank"></i> Net Banking</button>
            <button class="btn btn-outline btn-sm" style="flex:1" onclick="showToast('Wallet selected','')"><i class="ti ti-wallet"></i> Wallet</button>
          </div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:12px;font-size:11px;color:var(--gray-400)">
            <i class="ti ti-lock" style="color:var(--success)"></i> Secured by Stripe · PCI DSS Compliant
          </div>
        </div>
      </div>
      <div style="display:flex;gap:10px">
        <button class="btn btn-outline flex-1" onclick="prevStep()"><i class="ti ti-arrow-left"></i> Back</button>
        <button class="btn btn-primary flex-1" onclick="nextStep()">Pay & Confirm <i class="ti ti-lock"></i></button>
      </div>`;
  }
  else if(currentStep===5){
    c.innerHTML=`
      <div class="booking-card" style="text-align:center;padding:40px 24px">
        <div style="width:72px;height:72px;background:var(--success-light);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:32px;color:var(--success)">
          <i class="ti ti-circle-check"></i>
        </div>
        <h2 style="font-size:20px;font-weight:700;margin-bottom:6px">Booking Confirmed!</h2>
        <p style="color:var(--gray-500);font-size:13px;margin-bottom:24px">Your booking #FX-28914 has been placed.<br>${bookingProvider.name} will arrive at the scheduled time.</p>
        <div class="price-breakdown" style="text-align:left">
          <div class="price-line"><span>Provider</span><span>${bookingProvider.name}</span></div>
          <div class="price-line"><span>Slot</span><span>${selectedSlot} today</span></div>
          <div class="price-line"><span>Services</span><span>${selectedServices.map(s=>s.name).join(', ')}</span></div>
          <div class="price-line total"><span>Total</span><span>₹${grand}</span></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:24px">
          <button class="btn btn-outline flex-1" onclick="switchView('tracking')"><i class="ti ti-map-pin"></i> Track Provider</button>
          <button class="btn btn-primary flex-1" onclick="switchView('receipt')"><i class="ti ti-receipt"></i> View Receipt</button>
        </div>
      </div>`;
  }
}

function toggleService(i,name,price){
  const idx=selectedServices.findIndex(s=>s.name===name);
  const chk=document.getElementById('chk-'+i);
  const item=document.getElementById('svc-'+i);
  if(idx>=0){selectedServices.splice(idx,1);if(chk)chk.checked=false;item.classList.remove('selected')}
  else{selectedServices.push({name,price});if(chk)chk.checked=true;item.classList.add('selected')}
  renderBookingStep();
}

function selectSlot(slot,el){
  selectedSlot=slot;
  renderBookingStep();
}

function setPayment(method,btn){
  paymentMethod=method;
  document.querySelectorAll('.pay-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
}

function nextStep(){if(currentStep<5){currentStep++;renderBookingStep()}}
function prevStep(){if(currentStep>1){currentStep--;renderBookingStep()}}

// DASHBOARD
function renderDashboard(){
  // Job queue
  const jq=document.getElementById('job-queue');
  if(jq)jq.innerHTML=JOB_QUEUE.map(j=>`
    <div class="job-item">
      <div><div class="job-service">${j.service}</div><div class="job-customer">${j.customer} · ${j.time}</div></div>
      <span class="job-status status-${j.status}">${j.status}</span>
    </div>`).join('');

  // Earnings chart
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals=[1800,2100,950,2800,3200,2450,0];
  const max=Math.max(...vals)||1;
  const ec=document.getElementById('earnings-chart');
  if(ec)ec.innerHTML=days.map((d,i)=>`
    <div class="earn-bar" style="height:${Math.round((vals[i]/max)*100)}%;min-height:${vals[i]>0?4:0}px" title="₹${vals[i].toLocaleString()}">
      <span>${d}</span>
    </div>`).join('');

  // Calendar
  const cal=document.getElementById('avail-calendar');
  if(cal){
    const slots=[
      {d:'Mon 22',t:'9–12','status':'avail'},{d:'Mon 22',t:'12–3','status':'booked'},{d:'Mon 22',t:'3–6','status':'avail'},
      {d:'Tue 23',t:'9–12','status':'avail'},{d:'Tue 23',t:'12–3','status':'avail'},{d:'Tue 23',t:'3–6','status':'off'},
      {d:'Wed 24',t:'9–12','status':'booked'},{d:'Wed 24',t:'12–3','status':'booked'},{d:'Wed 24',t:'3–6','status':'avail'},
    ];
    const colors={avail:'var(--success-light)',booked:'var(--primary-light)',off:'var(--gray-100)'};
    const textColors={avail:'var(--success)',booked:'var(--primary)',off:'var(--gray-400)'};
    const days2=['Mon 22','Tue 23','Wed 24'];
    cal.innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
      ${days2.map(d=>`
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--gray-600);margin-bottom:6px;text-align:center">${d}</div>
          ${slots.filter(s=>s.d===d).map(s=>`
            <div style="background:${colors[s.status]};border-radius:var(--radius);padding:8px;text-align:center;margin-bottom:4px;cursor:pointer;font-size:11px;color:${textColors[s.status]};font-weight:600" onclick="toggleCalSlot(this,'${s.status}')">
              ${s.t}<br><span style="font-size:9px;font-weight:400">${s.status==='avail'?'Open':s.status==='booked'?'Booked':'Day Off'}</span>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
  }
}

function toggleCalSlot(el,status){
  if(status==='booked'){showToast('Cannot modify a booked slot','');return}
  showToast('Availability updated','success');
}

function toggleAvailability(){
  const on=document.getElementById('avail-toggle').checked;
  const lbl=document.getElementById('avail-label');
  lbl.textContent=on?'Online':'Offline';
  lbl.className='avail-label '+(on?'online':'offline');
  showToast(on?'You are now online and receiving jobs':'You are now offline','');
}

// HISTORY
function renderHistory(){
  const h=document.getElementById('history-list');
  if(!h)return;
  h.innerHTML=HISTORY.map(r=>`
    <div class="review-card">
      <div class="review-header">
        <div class="avatar" style="background:var(--primary-light);color:var(--primary);width:38px;height:38px;font-size:12px">${r.provider.split(' ').map(w=>w[0]).join('')}</div>
        <div class="review-meta">
          <div class="reviewer-name">${r.provider}</div>
          <div class="review-service">${r.service} · ${r.date}</div>
          <div class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
        </div>
        <div style="text-align:right">
          <div class="font-bold text-primary">${r.amount}</div>
          <button class="btn btn-outline btn-sm" style="margin-top:4px;font-size:10px" onclick="showToast('Invoice downloaded','success')"><i class="ti ti-download"></i> Invoice</button>
        </div>
      </div>
      <div class="review-text">"${r.review}"</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
        <div class="review-date"><i class="ti ti-check-circle" style="color:var(--success)"></i> Verified booking</div>
        <button class="btn btn-outline" style="font-size:11px;padding:4px 10px" onclick="showToast('Booking again...','');openBooking(1)"><i class="ti ti-refresh"></i> Book Again</button>
      </div>
    </div>`).join('');
}

// RATING MODAL
function showRatingModal(){
  let rating=5;
  document.getElementById('modal-title').textContent='Rate Your Service';
  document.getElementById('modal-body').innerHTML=`
    <div style="text-align:center;margin-bottom:20px">
      <div class="avatar" style="background:var(--primary-light);color:var(--primary);width:56px;height:56px;font-size:18px;margin:0 auto 8px">RK</div>
      <div class="font-semibold">Rajesh Kumar</div>
      <div class="text-xs text-muted">Fan Installation · Today</div>
    </div>
    <div style="text-align:center;margin-bottom:16px">
      <div style="font-size:14px;margin-bottom:10px;color:var(--gray-600)">How was your experience?</div>
      <div id="star-row" style="display:flex;justify-content:center;gap:8px;font-size:32px;cursor:pointer">
        ${[1,2,3,4,5].map(i=>`<span onclick="setRating(${i})" id="star-${i}" style="color:${i<=rating?'#F59E0B':'#E2E8F0'};transition:color .1s">★</span>`).join('')}
      </div>
    </div>
    <div class="form-row"><label>Your Review</label><textarea rows="3" placeholder="Tell others about your experience..."></textarea></div>
    <div class="form-row"><label>Tip Provider (optional)</label>
      <div style="display:flex;gap:6px">
        ${[0,20,50,100].map(t=>`<button onclick="showToast(${t>0?'Tip of ₹'+t+' added':'No tip selected'},'${t>0?'success':''}')" style="flex:1;padding:8px;border-radius:var(--radius);border:1px solid var(--gray-200);background:white;cursor:pointer;font-size:12px;font-weight:600">${t===0?'No Tip':'₹'+t}</button>`).join('')}
      </div>
    </div>
    <button class="btn btn-primary w-full" onclick="closeModal();showToast('Review submitted! Thank you','success')"><i class="ti ti-send"></i> Submit Review</button>`;
  document.getElementById('modal-overlay').classList.add('open');
}

function setRating(r){
  [1,2,3,4,5].forEach(i=>{
    const s=document.getElementById('star-'+i);
    if(s)s.style.color=i<=r?'#F59E0B':'#E2E8F0';
  });
}

function closeModal(e){
  if(!e||e.target===document.getElementById('modal-overlay'))
    document.getElementById('modal-overlay').classList.remove('open');
}

// TOAST
function showToast(msg,type){
  const t=document.getElementById('toast');
  const m=document.getElementById('toast-msg');
  t.className='toast'+(type?' '+type:'');
  m.textContent=msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t=setTimeout(()=>t.classList.remove('show'),3000);
}

// INIT
renderCategories();
renderProviders(PROVIDERS);