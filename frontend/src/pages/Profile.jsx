// ─── Profile.jsx ─────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyEvents } from '../api';
import { useAuth } from '../AuthContext';

const TICO = { sports:'🏏', lunch:'🍽️', build:'💻', gaming:'🎮', movie:'🎬' };
const TBG  = { sports:'#051A0E', lunch:'#1A0800', build:'#060F28', gaming:'#100018', movie:'#180020' };
const FD   = d => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : '';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);

  useEffect(() => {
    getMyEvents().then(setMyEvents).catch(() => {});
  }, []);

  const created = myEvents.filter(e => e.isCreator).length;
  const joined  = myEvents.filter(e => !e.isCreator).length;

  function handleSignOut() {
    signOut();
    navigate('/onboard', { replace: true });
  }

  return (
    <div className="page-wrap">
      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24 }}>

        {/* Left sidebar */}
        <div>
          <div className="card" style={{ textAlign:'center', position:'sticky', top:82 }}>
            <div style={{
              width:72, height:72, borderRadius:20, background:'var(--grad)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, fontWeight:800, color:'#fff',
              margin:'0 auto 12px',
              boxShadow:'0 0 30px rgba(139,92,246,.35)'
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{user?.name}</div>
            <div style={{ fontSize:13, color:'var(--txt2)', marginBottom:18 }}>
              {user?.company} · {user?.tower} · Floor {user?.floor}
            </div>

            {/* Stats */}
            <div style={{ display:'flex', border:'1px solid var(--rim)', borderRadius:12, overflow:'hidden', marginBottom:18 }}>
              {[['Joined', joined], ['Created', created], ['Connections', 18]].map(([lbl, val], i) => (
                <div key={lbl} style={{ flex:1, padding:'11px 6px', borderRight: i<2 ? '1px solid var(--rim)' : undefined, textAlign:'center' }}>
                  <div style={{ fontSize:19, fontWeight:800 }}>{val}</div>
                  <div style={{ fontSize:10, color:'var(--txt3)', marginTop:2 }}>{lbl}</div>
                </div>
              ))}
            </div>

            <button className="btn-ghost" style={{ width:'100%', padding:10, marginBottom:10 }}
              onClick={() => window.showToast?.('✏️','Edit Profile','Coming soon!')}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>

        {/* Right main */}
        <div>
          {/* My Events */}
          <div className="card" style={{ marginBottom:16 }}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:7 }}>
              📅 My Events
            </div>
            {myEvents.length === 0
              ? <div style={{ color:'var(--txt3)', fontSize:14, padding:'16px 0' }}>No events yet. Join or create one!</div>
              : myEvents.slice(0, 8).map(e => (
                <div key={e.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--rim)' }}>
                  <div style={{ width:40, height:40, borderRadius:11, background: TBG[e.module?.toLowerCase()] || '#111', display:'flex', alignItems:'center', justifyContent:'center', fontSize:19, flexShrink:0 }}>
                    {TICO[e.module?.toLowerCase()] || '⚡'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{e.title}</div>
                    <div style={{ fontSize:11, color:'var(--txt3)' }}>{FD(e.eventDate)}{e.eventTime ? ' · '+e.eventTime : ''} · {e.location}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                    <span style={{ padding:'3px 9px', borderRadius:20, fontSize:11, fontWeight:700, background: e.expired ? 'var(--ink3)' : 'rgba(52,211,153,.12)', color: e.expired ? 'var(--txt3)' : 'var(--jade)', border: e.expired ? '1px solid var(--rim)' : undefined }}>
                      {e.expired ? 'Done' : 'Active'}
                    </span>
                    <span style={{ fontSize:11, color:'var(--txt3)' }}>{e.isCreator ? 'Created' : 'Joined'}</span>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Settings */}
          <div className="card">
            <div style={{ fontSize:16, fontWeight:700, marginBottom:16 }}>⚙️ Settings</div>
            {[
              { ico:'🔔', lbl:'Notifications',  fn: () => window.showToast?.('🔔','Notifications','Coming soon!') },
              { ico:'🔒', lbl:'Privacy',         fn: () => window.showToast?.('🔒','Privacy','Coming soon!') },
              { ico:'📱', lbl:'Phone Number',    fn: () => window.showToast?.('📱','Phone',`Saved as ${user?.phone || 'not set'}`) },
            ].map(s => (
              <div key={s.lbl} onClick={s.fn} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 0', borderBottom:'1px solid var(--rim)', cursor:'pointer' }}>
                <div style={{ width:34, height:34, borderRadius:9, background:'var(--ink3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>{s.ico}</div>
                <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{s.lbl}</span>
                <span style={{ fontSize:15, color:'var(--txt3)' }}>›</span>
              </div>
            ))}
            <div onClick={handleSignOut} style={{ display:'flex', alignItems:'center', gap:11, padding:'13px 0', cursor:'pointer' }}>
              <div style={{ width:34, height:34, borderRadius:9, background:'rgba(248,113,113,.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🚪</div>
              <span style={{ flex:1, fontSize:14, fontWeight:500, color:'var(--red)' }}>Sign Out</span>
              <span style={{ fontSize:15, color:'var(--txt3)' }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
