// ─── ModulePage.jsx ───────────────────────────────────────────────────────────
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModuleEvents, getEventHistory } from '../api';
import { EventCard } from '../components/shared.jsx';

const FILTERS = {
  sports: [['all','⚡','All'],['Cricket','🏏','Cricket'],['Badminton','🏸','Badminton'],['Chess','♟','Chess'],['Running','🏃','Running'],['Football','⚽','Football'],['TT','🏓','TT'],['Carrom','🎯','Carrom']],
  lunch:  [['all','⚡','All'],['Food Court','🍱','Food Court'],['Biryani','🍛','Biryani'],['Tea Break','☕','Tea Break'],['Outside','🌮','Outside']],
  build:  [['all','⚡','All'],['React','⚛️','React'],['Python','🐍','Python'],['AI/ML','🤖','AI/ML'],['Hackathon','⚡','Hackathon'],['Mobile','📱','Mobile']],
  gaming: [['all','⚡','All'],['BGMI','🔫','BGMI'],['FIFA','⚽','FIFA'],['Chess','♟','Chess'],['Board Games','🎲','Board Games'],['Valorant','🎯','Valorant']],
  movie:  [['all','⚡','All'],['Movie','🎬','Movie'],['OTT','📺','OTT'],['Concert','🎵','Concert']],
};

export default function ModulePage({ mod, icon, title, sub }) {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [history, setHistory] = useState([]);
  const [flt, setFlt]         = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [live, hist] = await Promise.all([getModuleEvents(mod), getEventHistory()]);
      setEvents(live);
      setHistory(hist.filter(e => e.module === mod));
    } catch {}
    finally { setLoading(false); }
  }, [mod]);

  useEffect(() => { load(); }, [load]);

  const filtered = flt === 'all' ? events : events.filter(e => e.activity === flt);
  const filtHist = flt === 'all' ? history : history.filter(e => e.activity === flt);
  const chips    = FILTERS[mod] || [['all','⚡','All']];

  return (
    <div className="page-wrap">
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
      <div style={{display:'flex',alignItems:'center',gap:18,marginBottom:28}}>
        <div style={{width:58,height:58,borderRadius:16,background:'var(--ink3)',border:'1px solid var(--rim)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>{icon}</div>
        <div><h1 style={{fontSize:30,fontWeight:800,marginBottom:4}}>{title}</h1><p style={{fontSize:14,color:'var(--txt2)'}}>{sub}</p></div>
      </div>
      <div className="filter-bar">
        {chips.map(([val, ico, lbl]) => (
          <div key={val} className={`fchip ${flt===val?'on':''}`} onClick={() => setFlt(val)}>
            <div className="fchip-ico">{ico}</div>
            <div className="fchip-lbl">{lbl}</div>
          </div>
        ))}
      </div>
      {loading ? <div style={{textAlign:'center',padding:'40px',color:'var(--txt3)'}}>Loading…</div> : (
        <>
          <div className="ev-grid">
            {filtered.length ? filtered.map(e => <EventCard key={e.id} ev={e} onRefresh={load}/>) : (
              <div className="empty-state" style={{gridColumn:'1/-1'}}><div className="empty-icon">🎯</div><div>No active events. Be the first!</div></div>
            )}
          </div>
          {filtHist.length > 0 && (
            <>
              <div className="sec-divider"/>
              <div style={{fontSize:17,fontWeight:700,marginBottom:16,color:'var(--txt2)'}}>📚 Past Events</div>
              <div className="ev-grid">{filtHist.map(e => <EventCard key={e.id} ev={e} isHist onRefresh={load}/>)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
