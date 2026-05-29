import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotif } from '../context/useNotif';

const TYPE_STYLES = {
  success: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  error:   { badge: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
  info:    { badge: 'bg-blue-100 text-blue-700',        dot: 'bg-blue-500'    },
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
        className={`relative p-2.5 rounded-xl transition-all duration-150
          ${open ? 'bg-blue-600 text-white shadow-md shadow-blue-300' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
      >
        <Bell size={20} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[380px] bg-white rounded-2xl z-50 overflow-hidden fade-in"
          style={{ boxShadow: '0 8px 32px rgba(37,99,235,0.15), 0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #dbeafe' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-blue-50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-14 text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl mx-auto mb-3 flex items-center justify-center">
                  <Bell size={22} className="text-blue-200" />
                </div>
                <p className="text-sm font-semibold text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                return (
                  <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                    className={`flex items-start gap-3 px-5 py-3.5 border-b border-slate-50 cursor-pointer
                      hover:bg-blue-50/50 transition-colors group
                      ${!n.read ? 'bg-blue-50/30' : ''}`}>
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${s.dot} ${!n.read ? 'pulse-dot' : 'opacity-40'}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold leading-snug ${!n.read ? 'text-slate-800' : 'text-slate-500'}`}>
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${s.badge}`}>{n.type}</span>
                        <span className="text-xs text-slate-400">{timeAgo(n.timestamp)}</span>
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                      className="p-1 text-slate-200 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
