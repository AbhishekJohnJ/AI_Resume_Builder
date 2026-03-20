import { useEffect, useState } from 'react';
import './Toast.css';

export function Toast({ message, type = 'success', onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => setVisible(false), 3000);
    const t3 = setTimeout(() => onDone?.(), 3350);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className={`toast-notification toast-${type}${visible ? ' toast-visible' : ''}`}>
      <span className="toast-icon">{type === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>
  );
}

// Global toast manager
let _setToasts = null;
export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type}
          onDone={() => setToasts(p => p.filter(x => x.id !== t.id))} />
      ))}
    </div>
  );
}

export function showToast(message, type = 'success') {
  _setToasts?.(p => [...p, { id: Date.now(), message, type }]);
}
