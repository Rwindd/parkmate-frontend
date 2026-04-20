// ─── AuthContext.js ───────────────────────────────────────────────────────────
// Stores the logged-in user. Any component can read it with useAuth().
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerOrLogin } from './api';
import { v4 as uuid } from 'uuid';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);   // user profile
  const [token, setToken] = useState(null);   // JWT
  const [loading, setLoading] = useState(true); // true while auto-login runs

  // On app start: check if deviceId exists → auto-login
  useEffect(() => {
    (async () => {
      const deviceId = localStorage.getItem('pm_device');
      if (!deviceId) { setLoading(false); return; }   // brand new device → show onboard
      try {
        const res = await registerOrLogin({ deviceId });
        localStorage.setItem('pm_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } catch (e) {
        // token invalid or server down — clear and show onboard
        localStorage.removeItem('pm_device');
        localStorage.removeItem('pm_token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Called from Onboarding page
  async function register(name, company, tower, floor, phone) {
    let deviceId = localStorage.getItem('pm_device');
    if (!deviceId) { deviceId = uuid(); localStorage.setItem('pm_device', deviceId); }
    const res = await registerOrLogin({ deviceId, name, company, tower, floor, phone });
    localStorage.setItem('pm_token', res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }

  function signOut() {
    localStorage.removeItem('pm_device');
    localStorage.removeItem('pm_token');
    setUser(null); setToken(null);
  }

  return (
    <Ctx.Provider value={{ user, token, loading, register, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
