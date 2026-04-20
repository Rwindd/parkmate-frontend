// ─── Clockpoint.jsx ───────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_BASE, getPresence, getChatHistory, sendChatMessage, checkIn, checkOut } from '../api';
import { useAuth } from '../AuthContext';

const AVC = ['#8B5CF6','#3B82F6','#EC4899','#10B981','#F59E0B','#EF4444'];
function fmt(t) { return t ? new Date(t).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : ''; }

export default function Clockpoint() {
  const { user } = useAuth();
  const [presence, setPresence] = useState([]);
  const [msgs, setMsgs]         = useState([]);
  const [input, setInput]       = useState('');
  const [atClock, setAtClock]   = useState(false);
  const chatRef  = useRef(null);
  const stompRef = useRef(null);

  // Load presence + chat history
  const loadPresence = useCallback(() => getPresence().then(setPresence).catch(()=>{}), []);
  useEffect(() => {
    loadPresence();
    getChatHistory().then(setMsgs).catch(()=>{});
  }, [loadPresence]);

  // WebSocket — live chat
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE}/ws`),
      onConnect: () => {
        client.subscribe('/topic/clockpoint/chat', m => {
          const msg = JSON.parse(m.body);
          setMsgs(prev => [...prev, msg]);
        });
        client.subscribe('/topic/clockpoint/presence', () => loadPresence());
      },
    });
    client.activate(); stompRef.current = client;
    return () => client.deactivate();
  }, [loadPresence]);

  // Scroll to bottom on new message
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);

  async function toggleClock() {
    try {
      if (atClock) { await checkOut(); setAtClock(false); window.showToast?.('👋','Left Clockpoint','You\'ve been removed.'); }
      else         { await checkIn();  setAtClock(true);  window.showToast?.('☕','You\'re at Clockpoint!','People can see you!'); }
      loadPresence();
    } catch { window.showToast?.('⚠️','Error','Could not update presence.'); }
  }

  async function send() {
    const txt = input.trim(); if (!txt) return;
    setInput('');
    try { await sendChatMessage(txt); }
    catch { window.showToast?.('⚠️','Error','Message failed.'); }
  }
  function onKey(e) { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  const coGroups = presence.reduce((a,p) => { a[p.company]=(a[p.company]||0)+1; return a; }, {});

  return (
    <div className="page-wrap">
      <div style={{textAlign:'center',padding:'16px 0 28px'}}>
        <div style={{fontSize:68,display:'inline-block',animation:'logoRock 3s ease-in-out infinite'}}>☕</div>
        <h1 style={{fontSize:32,fontWeight:800,margin:'10px 0 6px'}}>Clockpoint Lounge</h1>
        <p style={{fontSize:14,color:'var(--txt2)'}}>The iconic open hangout at Olympia. Check in, chill, chat live with anyone.</p>
      </div>

      <div className="clock-layout">
        <div>
          {/* Presence strip */}
          <div className="card" style={{marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontSize:14,fontWeight:700,display:'flex',alignItems:'center',gap:8}}><span className="live-dot"/>Who's here right now ({presence.length})</div>
              <button className={atClock ? 'btn-ghost' : 'btn-primary'} style={{padding:'8px 18px'}} onClick={toggleClock}>
                {atClock ? '🚪 Leave Clockpoint' : '📍 I\'m at Clockpoint'}
              </button>
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:10,minHeight:44}}>
              {presence.length === 0
                ? <span style={{color:'var(--txt3)',fontSize:13}}>Nobody here yet. Check in first! 👇</span>
                : presence.map((p,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 14px',borderRadius:50,background:'var(--ink3)',border:'1px solid var(--rim2)'}}>
                    <div style={{width:28,height:28,borderRadius:8,background:AVC[i%AVC.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#fff'}}>{p.name?.[0]}</div>
                    <div><div style={{fontSize:13,fontWeight:600}}>{p.name}</div><div style={{fontSize:10,color:'var(--txt3)'}}>{p.company}</div></div>
                    <span className="live-dot" style={{width:7,height:7}}/>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Live chat */}
          <div className="card" style={{display:'flex',flexDirection:'column',height:'calc(100vh - 420px)',minHeight:420,padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid var(--rim)',display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:20}}>💬</span>
              <div><div style={{fontSize:14,fontWeight:700}}>Clockpoint Chat</div><div style={{fontSize:12,color:'var(--txt3)'}}>Open for all Olympians — like a common WhatsApp group</div></div>
              <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:5,fontSize:11,color:'var(--jade)',fontWeight:700}}><span className="live-dot" style={{width:6,height:6}}/> Live</div>
            </div>
            <div ref={chatRef} style={{flex:1,overflowY:'auto',padding:'14px 18px',display:'flex',flexDirection:'column',gap:3}}>
              {msgs.map((m,i) => {
                const isSelf = m.senderId === user?.id;
                const isSystem = m.systemMessage;
                if (isSystem) return <div key={i} style={{textAlign:'center',padding:'4px 0'}}><span style={{fontSize:12,color:'var(--txt3)',fontStyle:'italic'}}>{m.text}</span></div>;
                return (
                  <div key={i} style={{display:'flex',gap:10,flexDirection: isSelf?'row-reverse':'row',padding:'4px 0'}}>
                    <div style={{width:34,height:34,borderRadius:10,background:AVC[i%AVC.length],display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff',flexShrink:0,alignSelf:'flex-start'}}>{m.senderName?.[0]}</div>
                    <div>
                      <div style={{display:'flex',alignItems:'baseline',gap:7,flexDirection:isSelf?'row-reverse':'row',marginBottom:3}}>
                        <span style={{fontSize:12,fontWeight:700}}>{m.senderName}</span>
                        <span style={{fontSize:10,color:'var(--txt3)'}}>{m.senderCompany}</span>
                        <span style={{fontSize:10,color:'var(--txt3)'}}>{fmt(m.sentAt)}</span>
                      </div>
                      <div style={{padding:'9px 13px',borderRadius:12,background:isSelf?'rgba(139,92,246,.18)':'var(--ink3)',fontSize:14,lineHeight:1.5,maxWidth:420,display:'inline-block',border:isSelf?'1px solid rgba(139,92,246,.2)':undefined}}>{m.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:'12px 16px',borderTop:'1px solid var(--rim)',display:'flex',gap:10,alignItems:'flex-end'}}>
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={onKey}
                placeholder="Say something to the whole park… 👋"
                rows={1} style={{flex:1,background:'var(--ink3)',border:'1.5px solid var(--rim)',borderRadius:12,padding:'10px 14px',color:'var(--txt)',fontSize:14,resize:'none',outline:'none',maxHeight:120,lineHeight:1.45,fontFamily:'inherit'}}/>
              <button onClick={send} style={{width:42,height:42,borderRadius:12,background:'var(--grad)',border:'none',color:'#fff',fontSize:18,flexShrink:0,boxShadow:'0 3px 12px rgba(139,92,246,.35)',cursor:'pointer'}}>➤</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>🏢 About Clockpoint</div>
            <div style={{fontSize:13,color:'var(--txt2)',lineHeight:1.8}}>The open-air lounge between towers where everyone from HP, Verizon, Cognizant and all companies sit together.<br/><br/>✅ Check in when you arrive<br/>✅ Chat with anyone in the park<br/>✅ Leave when you head back</div>
          </div>
          <div className="card" style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>👥 Companies here now</div>
            {Object.entries(coGroups).map(([co,n]) => (
              <div key={co} style={{fontSize:13,color:'var(--txt2)',marginBottom:6}}><b style={{color:'var(--txt)'}}>{co}</b> — {n} person{n>1?'s':''}</div>
            ))}
            {Object.keys(coGroups).length===0 && <div style={{fontSize:13,color:'var(--txt3)'}}>Nobody at Clockpoint yet</div>}
          </div>
          <div className="card">
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>📢 Chat rules</div>
            <div style={{fontSize:13,color:'var(--txt2)',lineHeight:1.8}}>• Be cool — everyone's a colleague<br/>• No confidential company info<br/>• Have fun 🎉</div>
          </div>
        </div>
      </div>
    </div>
  );
}
