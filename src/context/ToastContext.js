import React, { createContext, useContext, useState, useCallback } from 'react';

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3800);
  }, []);

  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = { success: '#16A34A', error: '#DC2626', info: '#1B4FD8', warning: '#D97706' };

  return (
    <Ctx.Provider value={toast}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: colors[t.type] || colors.info,
            color: '#fff', padding: '11px 16px', borderRadius: 10,
            fontSize: 13, fontWeight: 500, maxWidth: 320,
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            display: 'flex', alignItems: 'center', gap: 8,
            animation: 'seSlideUp .25s ease',
          }}>
            <span style={{ fontSize: 15 }}>{icons[t.type]}</span> {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
