// ─── api.js ─────────────────────────────────────────────────────────────────
// All calls to the Spring Boot backend go through here.
// Change API_BASE to your Render URL when deploying.
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios';

// LOCAL DEV  → http://localhost:8080
// PRODUCTION → https://parkmate-backend.onrender.com
export const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: API_BASE + '/api' });

// Attach JWT token to every request automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pm_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── AUTH ──────────────────────────────────────────────────────────────────────
// Called on every page load. If deviceId exists → auto-login (skip onboarding).
// If deviceId is new → registers the user → one-time onboarding.
export const registerOrLogin = (payload) =>
  api.post('/auth/register', payload).then(r => r.data);

// ── EVENTS ───────────────────────────────────────────────────────────────────
export const getHomeEvents   = ()           => api.get('/events').then(r => r.data);
export const getModuleEvents = (mod)        => api.get(`/events/module/${mod}`).then(r => r.data);
export const getEventHistory = ()           => api.get('/events/history').then(r => r.data);
export const getMyEvents     = ()           => api.get('/events/mine').then(r => r.data);
export const createEvent     = (body)       => api.post('/events', body).then(r => r.data);
export const joinEvent       = (id)         => api.post(`/events/${id}/join`).then(r => r.data);
export const leaveEvent      = (id)         => api.delete(`/events/${id}/join`).then(r => r.data);
export const cancelEvent     = (id)         => api.delete(`/events/${id}`).then(r => r.data);
export const cancelByActivity= (act)        => api.delete(`/events/activity/${act}`).then(r => r.data);

// ── CLOCKPOINT ───────────────────────────────────────────────────────────────
export const getPresence     = ()     => api.get('/clockpoint/presence').then(r => r.data);
export const checkIn         = ()     => api.post('/clockpoint/join').then(r => r.data);
export const checkOut        = ()     => api.delete('/clockpoint/join').then(r => r.data);
export const getChatHistory  = ()     => api.get('/clockpoint/chat').then(r => r.data);
export const sendChatMessage = (text) => api.post('/clockpoint/chat', { text }).then(r => r.data);

// ── ANONYMOUS ─────────────────────────────────────────────────────────────────
export const getAnonPosts    = ()     => api.get('/anon').then(r => r.data);
export const postAnon        = (text) => api.post('/anon', { text }).then(r => r.data);
export const relatePost      = (id)   => api.post(`/anon/${id}/relate`).then(r => r.data);

// ── OLYMPIANS ─────────────────────────────────────────────────────────────────
export const getAllUsers      = ()     => api.get('/users').then(r => r.data);
export const getCompanyStats = ()     => api.get('/users/companies').then(r => r.data);
