// ─── Toast.jsx ───────────────────────────────────────────────────────────────
export default function Toast({ ico, title, body }) {
  return (
    <div className="toast">
      <div className="toast-ico">{ico}</div>
      <div><div className="toast-title">{title}</div><div className="toast-body">{body}</div></div>
    </div>
  );
}

// ─── EventCard.jsx ────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { joinEvent, leaveEvent, cancelEvent } from '../api';
import { useAuth } from '../AuthContext';

const AVC = ['#8B5CF6','#3B82F6','#EC4899','#10B981','#F59E0B','#EF4444','#6366F1'];
const FD  = d => d ? new Date(d).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : '';

export function EventCard({ ev, isHist = false, onRefresh }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const spotsLeft  = ev.spots - (ev.joiners?.length || 0);
  const isCreator  = user?.id === ev.creatorId;
  const isJoined   = ev.joiners?.some(j => j.userId === user?.id);

  let pillClass = 'pill-open', pillText = `${spotsLeft} spots left`;
  if (isHist)         { pillClass = 'pill-hist'; pillText = 'Ended'; }
  else if (spotsLeft <= 0) { pillClass = 'pill-full'; pillText = 'Full'; }
  else if (spotsLeft <= 2) { pillClass = 'pill-few';  pillText = `${spotsLeft} left!`; }

  async function handleJoin() {
    setLoading(true);
    try { await joinEvent(ev.id); onRefresh?.(); window.showToast?.('🎉','Joined!','Creator will see your name.'); }
    catch (e) { window.showToast?.('⚠️','Error', e?.response?.data?.message || 'Could not join'); }
    finally { setLoading(false); }
  }
  async function handleLeave() {
    setLoading(true);
    try { await leaveEvent(ev.id); onRefresh?.(); window.showToast?.('👋','Left event','Spot is open again.'); }
    catch { window.showToast?.('⚠️','Error','Could not leave'); }
    finally { setLoading(false); }
  }
  async function handleCancel() {
    if (!window.confirm('Cancel this event?')) return;
    setLoading(true);
    try { await cancelEvent(ev.id); onRefresh?.(); window.showToast?.('🗑','Cancelled','Event removed.'); }
    catch { window.showToast?.('⚠️','Error','Could not cancel'); }
    finally { setLoading(false); }
  }

  return (
    <div className={`ev-card ${isHist ? 'ev-hist' : ''}`}>
      <div className="ev-top">
        <div className="ev-act-badge">
          <div className="ev-act-ico">{ev.activityIcon || '⚡'}</div>
          <span className="ev-act-name">{ev.activity}</span>
        </div>
        <span className={`pill ${pillClass}`}>{pillText}</span>
      </div>
      <div className="ev-title">{ev.title}</div>
      <div className="ev-metas">
        <div className="ev-mr">📅 {isHist ? 'Past: ' : ''}{FD(ev.eventDate)}{ev.eventTime ? ' · ' + ev.eventTime : ''}</div>
        <div className="ev-mr">📍 {ev.location}</div>
        <div className="ev-mr">👤 by {ev.creatorName}</div>
      </div>
      <div className="ev-foot">
        <div className="av-group">
          {(ev.joiners || []).slice(0, 3).map((j, i) => (
            <div key={j.userId} className="av-mini" style={{ background: AVC[i % AVC.length] }}>{j.name?.[0]}</div>
          ))}
          <span className="av-cnt">{ev.joiners?.length || 0} joined</span>
        </div>
        <div className="ev-actions">
          {isHist ? (
            <span className="hist-badge">✓ Done</span>
          ) : isCreator ? (
            <button className="btn-cancel-ev" onClick={handleCancel} disabled={loading}>🗑 Cancel</button>
          ) : isJoined ? (
            <>
              <button className="btn-join joined" disabled>Joined ✓</button>
              <button className="btn-leave" onClick={handleLeave} disabled={loading}>Leave</button>
            </>
          ) : spotsLeft <= 0 ? (
            <button className="btn-join full" disabled>Full</button>
          ) : (
            <button className="btn-join" onClick={handleJoin} disabled={loading}>
              {loading ? '...' : 'Join →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
