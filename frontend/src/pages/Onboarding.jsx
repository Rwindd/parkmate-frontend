// ─── Onboarding.jsx ───────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import './Onboarding.css';

const PARADE = [
  { e: '🏏', l: 'Sports'     },
  { e: '🍽️', l: 'Lunch'      },
  { e: '☕', l: 'Clockpoint' },
  { e: '🎮', l: 'Gaming'     },
  { e: '💻', l: 'Build'      },
  { e: '🎬', l: 'Movies'     },
  { e: '👻', l: 'Anon'       },
];

export default function Onboarding() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name:'', company:'', floor:'', phone:'' });
  const [tower, setTower]   = useState('Citius');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false);

  // If already logged in → go home
  useEffect(() => { if (!loading && user) navigate('/', { replace: true }); }, [user, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.company || !form.floor) { setErr('Please fill in all fields.'); return; }
    setBusy(true); setErr('');
    try {
      await register(form.name, form.company, tower, form.floor, form.phone);
      navigate('/', { replace: true });
    } catch {
      setErr('Something went wrong. Try again.');
    } finally { setBusy(false); }
  }

  return (
    <div className="ob-page">
      <div className="ob-orb ob-orb-1"/><div className="ob-orb ob-orb-2"/><div className="ob-orb ob-orb-3"/>
      <div className="ob-wrap">

        {/* LEFT — hero */}
        <div className="ob-left">
          <div className="ob-logo-ring">⬡</div>
          <div className="ob-parade">
            {PARADE.map((p,i) => (
              <div key={i} className="parade-item" style={{ animationDelay: `${i*0.2}s` }}>
                <span>{p.e}</span><span className="parade-lbl">{p.l}</span>
              </div>
            ))}
          </div>
          <h1 className="ob-headline">Your whole<br/>tech park<br/>in <em>one place.</em></h1>
          <p className="ob-tagline">ParkMate connects everyone in Olympia Tech Park — like Discord for your office building. 14,000+ colleagues. One community.</p>
          <div className="ob-chips">
            <div className="ob-chip">🏢 <b>Olympia</b> only</div>
            <div className="ob-chip">🟢 <b>Live</b> Clockpoint chat</div>
            <div className="ob-chip">🔒 No work email</div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="ob-card">
          <div className="ob-card-title">Join ParkMate 👋</div>
          <div className="ob-card-sub">One-time setup. We remember you — no re-login ever.</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="e.g. Aravindh Kumar"
                value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" placeholder="e.g. HP, Verizon, Cognizant…"
                value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} />
            </div>
            <div className="ob-two-col">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tower</label>
                <div className="tower-grid">
                  {['Citius','Altius','Fortius'].map(t => (
                    <div key={t} className={`tower-opt ${tower===t?'on':''}`} onClick={() => setTower(t)}>{t}</div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Floor</label>
                <input className="form-input" type="number" placeholder="7" min="1" max="25"
                  value={form.floor} onChange={e => setForm(f => ({...f, floor: e.target.value}))} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 18 }}>
              <label className="form-label">Phone (shown only to event joiners)</label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
            </div>
            {err && <p className="ob-err">{err}</p>}
            <button className="ob-submit" type="submit" disabled={busy}>
              {busy ? 'Joining…' : 'Enter Olympia →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
