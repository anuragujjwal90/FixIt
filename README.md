# 🔧 ServeEasy — Local Service Finder

React + Supabase marketplace connecting customers with local service professionals.

---

## ⚡ Quick Start (5 minutes)

### 1. Create a Supabase project
- Go to https://supabase.com → New project
- Copy your **Project URL** and **anon public key** from Settings → API

### 2. Run the database schema
- In Supabase dashboard → SQL Editor → paste the entire contents of `supabase_schema.sql` → Run

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and anon key
```

### 4. Install and start
```bash
npm install
npm start
```

App opens at http://localhost:3000

---

## 🔑 Demo Accounts (after signing up via the app)

Sign up with any email/password. The seed providers in the DB have no auth user linked — use the app's **"Provider"** register tab to create your own provider account.

---

## 📁 Project Structure

```
src/
  App.js                  # Router + auth guards
  index.js                # React root
  lib/supabase.js         # All Supabase queries + realtime
  context/
    AuthContext.js        # Auth state (user, profile, provider)
    ToastContext.js       # Global toast notifications
  components/layout/
    Navbar.jsx            # Top navigation
  pages/
    AuthPage.jsx          # Login / Register (customer + provider)
    HomePage.jsx          # Browse providers + hero search
    BookingPage.jsx       # 5-step booking flow
    TrackingPage.jsx      # Live job tracking + rating modal
    HistoryPage.jsx       # Customer booking history
    ReceiptPage.jsx       # GST invoice download
    DashboardPage.jsx     # Provider dashboard + metrics
    JobsPage.jsx          # Provider job queue management
    OnboardingPage.jsx    # Provider profile + docs + subscription
    SettingsPage.jsx      # Account settings + password change
  styles/global.css       # All CSS (design tokens + components)
supabase_schema.sql       # Full DB schema + seed data
```

---

## ✅ Features

| Feature | Status |
|---|---|
| Customer & Provider Auth (Supabase) | ✅ |
| Browse providers by category/filter | ✅ |
| 5-step booking flow | ✅ |
| Split payment (deposit + balance) | ✅ |
| Live job tracking + timeline | ✅ |
| Supabase Realtime booking updates | ✅ |
| Provider availability toggle | ✅ |
| Provider job accept/advance status | ✅ |
| Star ratings + reviews | ✅ |
| GST invoice download | ✅ |
| Provider subscription plans | ✅ |
| Document verification UI | ✅ |
| Provider earnings dashboard | ✅ |
| Account settings + password change | ✅ |
| Surge pricing indicator | ✅ |
| Mobile responsive | ✅ |
