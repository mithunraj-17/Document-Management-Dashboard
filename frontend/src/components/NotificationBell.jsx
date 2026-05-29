import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

const TYPE_STYLES = {
  success: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
};

const TYPE_DOT = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotif();
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-xl hover:bg-blue-50 transition-colors text-slate-600 hover:text-blue-600"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">Notifications</h3>
              {unreadCount > 0 && <p className="text-xs text-slate-400">{unreadCount} unread</p>}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${TYPE_DOT[n.type] || TYPE_DOT.info}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.read ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TYPE_STYLES[n.type] || TYPE_STYLES.info}`}>
                        {n.type}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(n.timestamp)}</span>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    className="text-slate-300 hover:text-red-400 transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
