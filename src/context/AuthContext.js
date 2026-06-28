import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getProfile, getMyProvider } from '../lib/supabase';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // supabase auth user
  const [profile, setProfile] = useState(null); // profiles row
  const [provider, setProvider] = useState(null); // providers row (if role=provider)
  const [loading, setLoading] = useState(true);

  async function loadUserData(supaUser) {
    const prof = await getProfile(supaUser.id);
    setProfile(prof);
    if (prof?.role === 'provider') {
      const prov = await getMyProvider(supaUser.id);
      setProvider(prov);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user).finally(() => setLoading(false));
      } else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadUserData(session.user);
      } else {
        setUser(null); setProfile(null); setProvider(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const data = await signIn({ email, password });
    setUser(data.user);
    await loadUserData(data.user);
    return data.user;
  };

  const register = async (fields, isProvider = false) => {
    const role = isProvider ? 'provider' : 'customer';
    const data = await signUp({ ...fields, role, providerData: isProvider ? fields : null });
    return data;
  };

  const logout = async () => {
    await signOut();
    setUser(null); setProfile(null); setProvider(null);
  };

  const refreshProvider = async () => {
    if (user) { const p = await getMyProvider(user.id); setProvider(p); }
  };

  return (
    <Ctx.Provider value={{ user, profile, provider, loading, login, register, logout, refreshProvider, isProvider: profile?.role === 'provider' }}>
      {children}
    </Ctx.Provider>
  );
}
