// ─── Toast.jsx ───────────────────────────────────────────────────────────────
export default function Toast({ ico, title, body }) {
  return (
    <div className="toast">
      <div className="toast-ico">{ico}</div>
      <div>
        <div className="toast-title">{title}</div>
        <div className="toast-body">{body}</div>
      </div>
    </div>
  );
}
