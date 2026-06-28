import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Providers, useAuth } from './context';
import Navbar    from './pages/Navbar';
import AuthPage  from './pages/AuthPage';
import HomePage  from './pages/HomePage';
import BookingPage  from './pages/BookingPage';
import TrackPage    from './pages/TrackPage';
import HistoryPage  from './pages/HistoryPage';
import ReceiptPage  from './pages/ReceiptPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage      from './pages/JobsPage';
import OnboardingPage from './pages/OnboardingPage';

function RequireAuth({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: loc }} replace />;
  return children;
}
function RequireProvider({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: loc }} replace />;
  if (user.role !== 'provider') return <Navigate to="/" replace />;
  return children;
}
function RequireCustomer({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: loc }} replace />;
  if (user.role === 'provider') return <Navigate to="/dashboard" replace />;
  return children;
}
function GuestOnly({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'provider' ? '/dashboard' : '/'} replace />;
  return children;
}

function Layout({ children }) {
  return <><Navbar /><main style={{ minHeight: 'calc(100vh - 60px)' }}>{children}</main></>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<GuestOnly><AuthPage /></GuestOnly>} />
      <Route path="/" element={<Layout><HomePage /></Layout>} />
      <Route path="/booking" element={<RequireCustomer><Layout><BookingPage /></Layout></RequireCustomer>} />
      <Route path="/track"   element={<RequireAuth><Layout><TrackPage /></Layout></RequireAuth>} />
      <Route path="/history" element={<RequireCustomer><Layout><HistoryPage /></Layout></RequireCustomer>} />
      <Route path="/receipt" element={<RequireAuth><Layout><ReceiptPage /></Layout></RequireAuth>} />
      <Route path="/dashboard"  element={<RequireProvider><Layout><DashboardPage /></Layout></RequireProvider>} />
      <Route path="/jobs"       element={<RequireProvider><Layout><JobsPage /></Layout></RequireProvider>} />
      <Route path="/onboarding" element={<RequireProvider><Layout><OnboardingPage /></Layout></RequireProvider>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
}
