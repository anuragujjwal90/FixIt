 Project Structure
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


✅ Features
Feature	Status
Customer & Provider Auth (Supabase)	✅
Browse providers by category/filter	✅
5-step booking flow	✅
Split payment (deposit + balance)	✅
Live job tracking + timeline	✅
Supabase Realtime booking updates	✅
Provider availability toggle	✅
Provider job accept/advance status	✅
Star ratings + reviews	✅
GST invoice download	✅
Provider subscription plans	✅
Document verification UI	✅
Provider earnings dashboard	✅
Account settings + password change	✅
Surge pricing indicator	✅
Mobile responsive	✅ 
