// ─── Home.jsx ─────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHomeEvents, getPresence } from '../api';
import { useAuth } from '../AuthContext';
import { EventCard } from '../components/shared.jsx';

const MODULES = [
  { to:'/sports',    bg:'#051A0E', border:'rgba(52,211,153,.2)',  ico:'🏏', name:'Sports',        cnt:'12 active events', live:true,  liveColor:'var(--jade)' },
  { to:'/lunch',     bg:'#1A0800', border:'rgba(251,191,36,.2)',  ico:'🍽️', name:'Lunch Buddies', cnt:'8 groups forming', live:true,  liveColor:'var(--gold)' },
  { to:'/build',     bg:'#060F28', border:'rgba(99,102,241,.2)',  ico:'💻', name:'Build Together', cnt:'5 projects open'  },
  { to:'/gaming',    bg:'#100018', border:'rgba(139,92,246,.25)', ico:'🎮', name:'Gaming Buddies', cnt:'9 lobbies open'   },
  { to:'/movie',     bg:'#180020', border:'rgba(244,114,182,.2)', ico:'🎬', name:'Movie Together', cnt:'3 plans this week'},
  { to:'/anon',      bg:'#0E0E0E', border:'rgba(148,163,184,.2)', ico:'👻', name:'Anonymous',      cnt:'47 posts today',  live:true,  liveColor:'var(--txt2)' },
  { to:'/clockpoint',bg:'#001818', border:'rgba(45,212,191,.25)', ico:'☕', name:'Clockpoint Lounge', cnt:'Open · Live chat inside', live:true, liveColor:'var(--teal)', wide:true },
  { to:'/anon',      bg:'#1A0020', border:'rgba(244,114,182,.3)', ico:'💃', name:'Divas',          cnt:'Girls only space' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [presence, setPresence] = useState([]);
  const [onlineCnt, setOnlineCnt] = useState(142);

  useEffect(() => {
    getHomeEvents().then(setEvents).catch(() => {});
    getPresence().then(setPresence).catch(() => {});
    const t = setInterval(() => setOnlineCnt(130 + Math.floor(Math.random()*30)), 5000);
    return () => clearInterval(t);
  }, []);

  function refresh() { getHomeEvents().then(setEvents).catch(() => {}); }

  return (
    <div className="page-wrap">
      {/* Banner */}
      <div className="home-banner">
        <div className="home-hello"><span className="live-dot"/> OLYMPIA TECH PARK · LIVE NOW</div>
        <h1 className="home-h1">Hey <em className="grad-text">{user?.name?.split(' ')[0] || 'Olympian'}</em>, what's up? 👋</h1>
        <p className="home-sub">Find your people. Across every company in the building.</p>
        <div className="stat-pills">
          <div className="sp">🏢 <b>14,000+</b> in park</div>
          <div className="sp">🟢 <b>{onlineCnt}</b> online</div>
          <div className="sp">📅 <b>{events.length || 37}</b> events</div>
          <div className="sp">☕ <b>{presence.length || 23}</b> at Clockpoint</div>
        </div>
      </div>

      {/* Module grid */}
      <div className="sec-head" style={{marginTop:32}}><div className="sec-title">Modules</div><div className="sec-sub">Pick your vibe</div></div>
      <div className="mods-grid">
        {MODULES.map((m, i) => (
          <div key={i} className={`mod-card ${m.wide?'mod-wide':''}`}
            style={{ background:`linear-gradient(135deg,${m.bg} 0%,${m.bg}99 100%)`, borderColor: m.border }}
            onClick={() => navigate(m.to)}>
            <div className="mc-ico">{m.ico}</div>
            <div className="mc-name">{m.name}</div>
            <div className="mc-cnt">{m.cnt}</div>
            {m.live && <div className="mc-live" style={{color: m.liveColor}}><span className="live-dot" style={{background: m.liveColor, boxShadow:'none', width:6, height:6}}/> Live</div>}
            <div className="mc-bg-e">{m.ico}</div>
          </div>
        ))}
      </div>

      {/* Feed + sidebar */}
      <div className="feed-layout">
        <div>
          <div className="sec-head"><div className="sec-title">Live Feed</div></div>
          {events.slice(0,5).map(e => (
            <div key={e.id} style={{marginBottom:10}}>
              <EventCard ev={e} onRefresh={refresh} />
            </div>
          ))}
        </div>
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>☕ At Clockpoint now</div>
            {presence.slice(0,4).map((p,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:9,marginBottom:9}}>
                <div style={{width:32,height:32,borderRadius:9,background:'var(--grad)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,color:'#fff'}}>{p.name?.[0]}</div>
                <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:'var(--txt3)'}}>{p.company}</div></div>
              </div>
            ))}
            {presence.length === 0 && <div style={{fontSize:13,color:'var(--txt3)'}}>Nobody at Clockpoint yet</div>}
          </div>
          <div className="card">
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🔥 Trending</div>
            {[['#Sports','HP vs Verizon cricket Sunday','42 interested'],['#Build','React hackathon team forming','18 watching'],['#Anonymous','Food court AC debate 😤','89 relate']].map(([tag,txt,cnt],i) => (
              <div key={i} style={{paddingBottom:10,marginBottom:10,borderBottom: i<2 ? '1px solid var(--rim)':undefined}}>
                <div style={{fontSize:11,color:'var(--violet)',fontWeight:700}}>{tag}</div>
                <div style={{fontSize:13,color:'var(--txt2)'}}>{txt}</div>
                <div style={{fontSize:11,color:'var(--txt3)',marginTop:2}}>{cnt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
