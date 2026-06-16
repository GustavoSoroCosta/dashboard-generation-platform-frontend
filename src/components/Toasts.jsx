// Notificações breves no canto do ecrã (feedback visual das ações).
function Toasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" aria-hidden="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}

export default Toasts;
