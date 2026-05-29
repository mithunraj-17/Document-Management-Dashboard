import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotif } from '../context/useNotif';

const TYPE_STYLES = {
  success: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
  error:   { badge: 'bg-red-100 text-red-700',         dot: 'bg-red-500',     bar: 'bg-red-500'     },
  info:    { badge: 'bg-blue-100 text-blue-700',        dot: 'bg-blue-500',    bar: 'bg-blue-500'    },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotif();

  return (
    <div>
      {/* Hero */}
      <div className="hero-gradient">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Bell size={18} className="text-white" />
                </div>
                <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest">Inbox</p>
              </div>
              <h1 className="text-3xl font-black text-white mt-2">Notifications</h1>
              <p className="text-blue-100 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread · ` : ''}{notifications.length} total
              </p>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-2 bg-white text-blue-700 font-bold text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-blue-50 transition-colors">
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {notifications.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Bell size={28} className="text-blue-200" strokeWidth={1.5} />
            </div>
            <p className="font-bold text-slate-500">No notifications yet</p>
            <p className="text-sm text-slate-400">Upload more than 3 files to trigger a bulk notification</p>
          </div>
        ) : (
          <div className="card overflow-hidden fade-in">
            {notifications.map((n, i) => {
              const s = TYPE_STYLES[n.type] || TYPE_STYLES.info;
              return (
                <div key={n.id} onClick={() => !n.read && markRead(n.id)}
                  className={`relative flex items-start gap-4 px-6 py-5 cursor-pointer
                    hover:bg-blue-50/40 transition-colors group
                    ${i < notifications.length - 1 ? 'border-b border-slate-50' : ''}
                    ${!n.read ? 'bg-blue-50/20' : ''}`}>

                  {/* Left accent bar */}
                  {!n.read && (
                    <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${s.bar}`} />
                  )}

                  {/* Dot */}
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${s.dot} ${!n.read ? 'pulse-dot' : 'opacity-30'}`} />

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm leading-snug ${!n.read ? 'text-slate-800' : 'text-slate-500'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2.5 mt-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg ${s.badge}`}>{n.type}</span>
                      <span className="text-xs text-slate-400">{formatDate(n.timestamp)}</span>
                      {!n.read && (
                        <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                  </div>

                  <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                    className="p-1.5 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
