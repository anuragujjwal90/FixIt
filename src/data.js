// ── Providers ─────────────────────────────────────────────────────────────
export const PROVIDERS = [
  {
    id: 'p1', name: 'Rajesh Kumar', title: 'Master Electrician', category: 'Electrical',
    bio: 'Licensed electrician with 8+ years across residential and commercial projects.',
    experience: 8, rating: 4.9, reviews: 342, jobs: 520,
    available: true, verified: true, plan: 'pro', surge: false,
    area: 'Chowk, Lucknow', avatar: 'RK', color: { bg: '#EFF6FF', fg: '#1D4ED8' },
    phone: '9812345678',
    services: [
      { id: 's1', name: 'Fan Installation', price: 250, duration: 60 },
      { id: 's2', name: 'Switch/Socket Repair', price: 150, duration: 30 },
      { id: 's3', name: 'Wiring Check', price: 200, duration: 45 },
      { id: 's4', name: 'MCB/Fuse Replacement', price: 180, duration: 30 },
      { id: 's5', name: 'New Connection', price: 400, duration: 90 },
    ],
    earnings: { today: 2450, week: 14200, month: 48200 },
    weeklyEarnings: [1800, 2100, 950, 2800, 3200, 2450, 0],
    docs: { aadhaar: 'verified', license: 'verified', background: 'pending' },
  },
  {
    id: 'p2', name: 'Sunita Devi', title: 'Professional Cleaner', category: 'Cleaning',
    bio: 'Expert in deep home cleaning, kitchen sanitisation, and post-renovation cleanup.',
    experience: 5, rating: 4.8, reviews: 210, jobs: 380,
    available: true, verified: true, plan: 'elite', surge: true,
    area: 'Gomti Nagar, Lucknow', avatar: 'SD', color: { bg: '#F0FDF4', fg: '#16A34A' },
    phone: '9823456789',
    services: [
      { id: 's6', name: 'Basic Home Cleaning', price: 400, duration: 120 },
      { id: 's7', name: 'Deep Cleaning', price: 800, duration: 240 },
      { id: 's8', name: 'Kitchen Deep Clean', price: 500, duration: 180 },
      { id: 's9', name: 'Bathroom Sanitisation', price: 300, duration: 90 },
      { id: 's10', name: 'Post-Construction Clean', price: 1200, duration: 360 },
    ],
    earnings: { today: 1800, week: 10500, month: 38000 },
    weeklyEarnings: [2200, 1800, 1500, 2100, 1900, 1800, 0],
    docs: { aadhaar: 'verified', license: 'verified', background: 'verified' },
  },
  {
    id: 'p3', name: 'Mohan Lal', title: 'Licensed Plumber', category: 'Plumbing',
    bio: 'Seasoned plumber specialising in leak repairs, installations, and waterproofing.',
    experience: 10, rating: 4.7, reviews: 189, jobs: 295,
    available: true, verified: true, plan: 'basic', surge: false,
    area: 'Aliganj, Lucknow', avatar: 'ML', color: { bg: '#FFFBEB', fg: '#D97706' },
    phone: '9834567890',
    services: [
      { id: 's11', name: 'Pipe Leak Repair', price: 300, duration: 60 },
      { id: 's12', name: 'Tap Replacement', price: 200, duration: 45 },
      { id: 's13', name: 'Drain Unclogging', price: 250, duration: 60 },
      { id: 's14', name: 'Water Heater Install', price: 500, duration: 120 },
      { id: 's15', name: 'Toilet Repair', price: 350, duration: 90 },
    ],
    earnings: { today: 1200, week: 8900, month: 32000 },
    weeklyEarnings: [1200, 1500, 800, 1900, 2100, 1200, 0],
    docs: { aadhaar: 'verified', license: 'verified', background: 'verified' },
  },
  {
    id: 'p4', name: 'Arjun Singh', title: 'AC Technician', category: 'AC Repair',
    bio: 'Certified HVAC technician for all brands of air conditioners.',
    experience: 7, rating: 4.9, reviews: 278, jobs: 410,
    available: false, verified: true, plan: 'pro', surge: true,
    area: 'Indira Nagar, Lucknow', avatar: 'AS', color: { bg: '#EFF6FF', fg: '#1E40AF' },
    phone: '9845678901',
    services: [
      { id: 's16', name: 'AC Service & Clean', price: 600, duration: 90 },
      { id: 's17', name: 'Gas Refill (1 ton)', price: 800, duration: 60 },
      { id: 's18', name: 'PCB Repair', price: 1200, duration: 120 },
      { id: 's19', name: 'AC Installation', price: 1500, duration: 180 },
      { id: 's20', name: 'Drain Pipe Clean', price: 300, duration: 30 },
    ],
    earnings: { today: 3200, week: 18500, month: 62000 },
    weeklyEarnings: [2800, 3200, 2100, 3800, 4200, 3200, 0],
    docs: { aadhaar: 'verified', license: 'verified', background: 'verified' },
  },
  {
    id: 'p5', name: 'Priya Kapoor', title: 'Interior Painter', category: 'Painting',
    bio: 'Specialist in interior and exterior painting with premium finishes.',
    experience: 4, rating: 4.6, reviews: 97, jobs: 145,
    available: true, verified: false, plan: 'basic', surge: false,
    area: 'Rajajipuram, Lucknow', avatar: 'PK', color: { bg: '#FDF2F8', fg: '#9D174D' },
    phone: '9856789012',
    services: [
      { id: 's21', name: '1 Room Painting', price: 800, duration: 240 },
      { id: 's22', name: 'Full Home (1BHK)', price: 4500, duration: 480 },
      { id: 's23', name: 'Exterior Wall', price: 2000, duration: 360 },
      { id: 's24', name: 'Touch-up Painting', price: 400, duration: 120 },
      { id: 's25', name: 'Waterproofing', price: 1500, duration: 300 },
    ],
    earnings: { today: 800, week: 5200, month: 18000 },
    weeklyEarnings: [600, 800, 0, 1200, 1400, 800, 0],
    docs: { aadhaar: 'verified', license: 'pending', background: 'pending' },
  },
  {
    id: 'p6', name: 'Deepak Yadav', title: 'Carpenter & Furniture Expert', category: 'Carpentry',
    bio: 'Custom furniture, door/window repair, and modular kitchen fitting.',
    experience: 6, rating: 4.5, reviews: 134, jobs: 205,
    available: true, verified: true, plan: 'pro', surge: false,
    area: 'Hazratganj, Lucknow', avatar: 'DY', color: { bg: '#FFF7ED', fg: '#9A3412' },
    phone: '9867890123',
    services: [
      { id: 's26', name: 'Door/Window Repair', price: 350, duration: 90 },
      { id: 's27', name: 'Furniture Assembly', price: 400, duration: 120 },
      { id: 's28', name: 'Wardrobe Fitting', price: 800, duration: 180 },
      { id: 's29', name: 'Custom Shelf', price: 600, duration: 150 },
      { id: 's30', name: 'Laminate Work', price: 500, duration: 120 },
    ],
    earnings: { today: 1600, week: 9800, month: 35000 },
    weeklyEarnings: [1400, 1600, 1200, 2000, 1800, 1600, 0],
    docs: { aadhaar: 'verified', license: 'verified', background: 'verified' },
  },
];

export const CATEGORIES = [
  { icon: '💧', name: 'Plumbing' },
  { icon: '⚡', name: 'Electrical' },
  { icon: '🧹', name: 'Cleaning' },
  { icon: '🔨', name: 'Carpentry' },
  { icon: '🎨', name: 'Painting' },
  { icon: '❄️', name: 'AC Repair' },
  { icon: '🐛', name: 'Pest Control' },
  { icon: '🔐', name: 'Locksmith' },
  { icon: '📦', name: 'Appliances' },
  { icon: '🌿', name: 'Gardening' },
  { icon: '📷', name: 'CCTV Install' },
  { icon: '🚚', name: 'Moving' },
];

export const DEMO_USERS = [
  { id: 'u1', name: 'Amit Gupta',   email: 'amit@demo.com',   password: 'demo123', role: 'customer', phone: '9876543210', address: '12, Gomti Nagar, Lucknow' },
  { id: 'u2', name: 'Priya Sharma', email: 'priya@demo.com',  password: 'demo123', role: 'customer', phone: '9876543211', address: 'Hazratganj, Lucknow' },
];

export const DEMO_PROVIDERS = [
  { id: 'pu1', name: 'Rajesh Kumar', email: 'rajesh@demo.com', password: 'demo123', role: 'provider', providerId: 'p1' },
  { id: 'pu2', name: 'Sunita Devi',  email: 'sunita@demo.com', password: 'demo123', role: 'provider', providerId: 'p2' },
];

export const DEMO_BOOKINGS = [
  {
    id: 'bk1', ref: 'SE-28914', customerId: 'u1', providerId: 'p1',
    providerName: 'Rajesh Kumar', category: 'Electrical',
    services: [{ name: 'Fan Installation', price: 250 }, { name: 'Wiring Check', price: 200 }],
    date: '2026-06-22', time: '11:00 AM', address: '12, Gomti Nagar, Lucknow',
    status: 'en_route', paymentStatus: 'deposit_paid',
    subtotal: 450, surgeFee: 0, convFee: 50, gst: 90, total: 590, deposit: 177,
    paymentMethod: 'card', invoiceNo: 'INV-2026-0892',
    review: null,
    timeline: [
      { status: 'confirmed', time: '10:15 AM', note: 'Booking confirmed' },
      { status: 'accepted',  time: '10:18 AM', note: 'Rajesh Kumar accepted' },
      { status: 'en_route', time: '10:45 AM', note: 'Provider en route' },
    ],
  },
  {
    id: 'bk2', ref: 'SE-28800', customerId: 'u1', providerId: 'p2',
    providerName: 'Sunita Devi', category: 'Cleaning',
    services: [{ name: 'Deep Cleaning', price: 800 }],
    date: '2026-06-12', time: '10:00 AM', address: '12, Gomti Nagar, Lucknow',
    status: 'completed', paymentStatus: 'paid',
    subtotal: 800, surgeFee: 160, convFee: 50, gst: 182, total: 1192, deposit: 0,
    paymentMethod: 'upi', invoiceNo: 'INV-2026-0845',
    review: { rating: 5, text: 'Did an amazing job. Very thorough with kitchen and bathrooms!' },
    timeline: [],
  },
  {
    id: 'bk3', ref: 'SE-28500', customerId: 'u1', providerId: 'p3',
    providerName: 'Mohan Lal', category: 'Plumbing',
    services: [{ name: 'Pipe Leak Repair', price: 300 }],
    date: '2026-06-05', time: '2:00 PM', address: '12, Gomti Nagar, Lucknow',
    status: 'completed', paymentStatus: 'paid',
    subtotal: 300, surgeFee: 0, convFee: 50, gst: 63, total: 413, deposit: 0,
    paymentMethod: 'card', invoiceNo: 'INV-2026-0790',
    review: { rating: 4, text: 'Good work, fixed the leak quickly. Slightly late but informed beforehand.' },
    timeline: [],
  },
];

export function calcPricing(services, hasSurge) {
  const subtotal = services.reduce((s, v) => s + v.price, 0);
  const surgeFee = hasSurge ? Math.round(subtotal * 0.2) : 0;
  const convFee  = subtotal > 0 ? 50 : 0;
  const base     = subtotal + surgeFee + convFee;
  const gst      = Math.round(base * 0.18);
  const total    = base + gst;
  const deposit  = Math.round(total * 0.3);
  return { subtotal, surgeFee, convFee, gst, total, deposit };
}
