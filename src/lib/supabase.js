import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── Auth helpers ──────────────────────────────────────────────────────────

export async function signUp({ email, password, name, phone, role = 'customer', providerData = null }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, phone, role } },
  });
  if (error) throw error;

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id, name, phone, role,
    });

    if (role === 'provider' && providerData) {
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      await supabase.from('providers').insert({
        user_id: data.user.id,
        name,
        phone,
        title: providerData.title || providerData.category + ' Professional',
        category: providerData.category,
        bio: providerData.bio || '',
        experience_years: parseInt(providerData.experience) || 1,
        avatar_initials: initials,
        is_available: false,
        is_verified: false,
        subscription_plan: 'basic',
        services: [],
        documents: { aadhaar: 'pending', license: 'pending', backgroundCheck: 'pending' },
        weekly_earnings: [0, 0, 0, 0, 0, 0, 0],
      });
    }
  }
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getProfile(userId) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}

export async function getMyProvider(userId) {
  const { data } = await supabase.from('providers').select('*').eq('user_id', userId).single();
  return data;
}

// ── Providers ─────────────────────────────────────────────────────────────

export async function fetchProviders(filters = {}) {
  let q = supabase.from('providers').select('*');
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.available) q = q.eq('is_available', true);
  if (filters.verified)  q = q.eq('is_verified', true);

  // Subscription order: elite first, then pro, then basic
  q = q.order('subscription_plan', { ascending: true })  // elite < pro < basic alphabetically — handled client side
        .order('rating', { ascending: false });

  const { data, error } = await q;
  if (error) throw error;

  // Sort by plan priority client-side
  const order = { elite: 0, pro: 1, basic: 2 };
  return (data || []).sort((a, b) =>
    (order[a.subscription_plan] ?? 2) - (order[b.subscription_plan] ?? 2) || b.rating - a.rating
  );
}

export async function fetchProvider(id) {
  const { data, error } = await supabase.from('providers').select('*').eq('id', id).single();
  if (error) throw error;
  const { data: reviews } = await supabase.from('reviews').select('*').eq('provider_id', id).order('created_at', { ascending: false });
  return { ...data, reviews: reviews || [] };
}

export async function updateProviderAvailability(providerId, isAvailable) {
  const { data, error } = await supabase.from('providers').update({ is_available: isAvailable }).eq('id', providerId).select().single();
  if (error) throw error;
  return data;
}

export async function updateProviderProfile(providerId, updates) {
  const { data, error } = await supabase.from('providers').update(updates).eq('id', providerId).select().single();
  if (error) throw error;
  return data;
}

export async function updateProviderSubscription(providerId, plan) {
  const { data, error } = await supabase.from('providers').update({ subscription_plan: plan }).eq('id', providerId).select().single();
  if (error) throw error;
  return data;
}

// ── Bookings ──────────────────────────────────────────────────────────────

const GST = 0.18;
const CONV = 50;
const SURGE = 0.20;

export function calcPricing(services, hasSurge) {
  const subtotal = services.reduce((s, v) => s + v.price, 0);
  const surgeFee = hasSurge ? Math.round(subtotal * SURGE) : 0;
  const base = subtotal + surgeFee + CONV;
  const gst = Math.round(base * GST);
  const total = base + gst;
  const deposit = Math.round(total * 0.30);
  return { subtotal, surge_fee: surgeFee, conv_fee: CONV, gst, total, deposit_amount: deposit };
}

export async function createBooking(payload) {
  const ref = 'SE-' + Date.now().toString().slice(-8);
  const inv = 'INV-2026-' + Math.floor(1000 + Math.random() * 9000);
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const row = {
    booking_ref: ref,
    invoice_number: inv,
    customer_id: payload.customerId,
    customer_name: payload.customerName,
    provider_id: payload.providerId,
    provider_name: payload.providerName,
    provider_category: payload.providerCategory,
    services: payload.services,
    scheduled_date: payload.scheduledDate,
    scheduled_time: payload.scheduledTime,
    address: payload.address,
    landmark: payload.landmark || '',
    notes: payload.notes || '',
    status: 'pending',
    payment_status: payload.paymentType === 'deposit' ? 'deposit_pending' : 'unpaid',
    payment_type: payload.paymentType || 'full',
    payment_method: payload.paymentMethod || 'card',
    subtotal: payload.pricing.subtotal,
    surge_fee: payload.pricing.surge_fee,
    conv_fee: payload.pricing.conv_fee,
    gst: payload.pricing.gst,
    total: payload.pricing.total,
    deposit_amount: payload.pricing.deposit_amount,
    timeline: [{ status: 'created', time: now, note: 'Booking created' }],
  };

  const { data, error } = await supabase.from('bookings').insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function fetchBookings(userId, role) {
  const col = role === 'provider' ? 'provider_id' : 'customer_id';
  // For provider: match user_id -> provider id via provider table
  if (role === 'provider') {
    const { data: prov } = await supabase.from('providers').select('id').eq('user_id', userId).single();
    if (!prov) return [];
    const { data } = await supabase.from('bookings').select('*').eq('provider_id', prov.id).order('created_at', { ascending: false });
    return data || [];
  }
  const { data } = await supabase.from('bookings').select('*').eq('customer_id', userId).order('created_at', { ascending: false });
  return data || [];
}

export async function fetchBooking(id) {
  const { data, error } = await supabase.from('bookings').select('*').eq('id', id).single();
  if (error) throw error;
  if (data?.provider_id) {
    const { data: prov } = await supabase.from('providers').select('id,name,phone,rating,avatar_initials').eq('id', data.provider_id).single();
    return { ...data, provider: prov };
  }
  return data;
}

export async function updateBookingStatus(bookingId, status, note) {
  const { data: current } = await supabase.from('bookings').select('timeline').eq('id', bookingId).single();
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeline = [...(current?.timeline || []), { status, time: now, note: note || statusNote(status) }];
  const updates = { status, timeline };
  if (status === 'completed') { updates.completed_at = new Date().toISOString(); updates.payment_status = 'paid'; }
  const { data, error } = await supabase.from('bookings').update(updates).eq('id', bookingId).select().single();
  if (error) throw error;
  return data;
}

export async function processPayment(bookingId, paymentMethod, type) {
  const { data: bk } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
  const amount = type === 'deposit' ? bk.deposit_amount : type === 'balance' ? bk.total - bk.deposit_amount : bk.total;
  const paymentStatus = type === 'deposit' ? 'deposit_paid' : 'paid';
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeline = [...(bk.timeline || []), { status: 'payment', time: now, note: `₹${amount} received (${type})` }];
  const newStatus = bk.status === 'pending' ? 'confirmed' : bk.status;
  const { data, error } = await supabase.from('bookings').update({ payment_status: paymentStatus, payment_method: paymentMethod, status: newStatus, timeline }).eq('id', bookingId).select().single();
  if (error) throw error;
  return { booking: data, amount };
}

export async function cancelBooking(bookingId) {
  const { data: bk } = await supabase.from('bookings').select('timeline').eq('id', bookingId).single();
  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const timeline = [...(bk?.timeline || []), { status: 'cancelled', time: now, note: 'Booking cancelled' }];
  const { data, error } = await supabase.from('bookings').update({ status: 'cancelled', timeline }).eq('id', bookingId).select().single();
  if (error) throw error;
  return data;
}

// ── Reviews ───────────────────────────────────────────────────────────────

export async function submitReview(bookingId, { customerId, providerId, customerName, rating, text, tip = 0 }) {
  const { data: rev, error } = await supabase.from('reviews').insert({
    booking_id: bookingId, customer_id: customerId, provider_id: providerId,
    customer_name: customerName, rating, text, tip,
  }).select().single();
  if (error) throw error;

  // Recalculate provider rating
  const { data: all } = await supabase.from('reviews').select('rating').eq('provider_id', providerId);
  if (all?.length) {
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await supabase.from('providers').update({ rating: Math.round(avg * 10) / 10, total_reviews: all.length }).eq('id', providerId);
  }

  await supabase.from('bookings').update({ review: { rating, text, tip } }).eq('id', bookingId);
  return rev;
}

// ── Realtime ──────────────────────────────────────────────────────────────

export function subscribeToBooking(bookingId, callback) {
  return supabase.channel(`booking:${bookingId}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `id=eq.${bookingId}` }, payload => callback(payload.new))
    .subscribe();
}

export function subscribeToProviderBookings(providerId, callback) {
  return supabase.channel(`provider_bookings:${providerId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings', filter: `provider_id=eq.${providerId}` }, payload => callback(payload.new))
    .subscribe();
}

function statusNote(s) {
  return { accepted: 'Provider accepted', en_route: 'Provider is on the way', arrived: 'Provider arrived', in_progress: 'Service in progress', completed: 'Service completed', cancelled: 'Cancelled' }[s] || s;
}
