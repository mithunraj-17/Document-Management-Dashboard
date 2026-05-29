import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotif } from '../context/useNotif';

const TYPE_STYLES = {
  success: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  error: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  info: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function NotificationsPage() {
  const { notifications, unreadCount, markRead, markAllRead, deleteNotif } = useNotif();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-500 mt-1">{unreadCount} unread · {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-20 text-center text-slate-400">
          <Bell size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications yet</p>
          <p className="text-sm mt-1">Notifications will appear here after uploads</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          {notifications.map((n, i) => {
            const style = TYPE_STYLES[n.type] || TYPE_STYLES.info;
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={`flex items-start gap-4 px-6 py-5 cursor-pointer hover:bg-slate-50 transition-colors
                  ${i < notifications.length - 1 ? 'border-b border-slate-50' : ''}
                  ${!n.read ? 'bg-blue-50/40' : ''}`}
              >
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
                <div className="flex-1">
                  <p className={`font-medium ${!n.read ? 'text-slate-800' : 'text-slate-500'}`}>{n.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      {n.type}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(n.timestamp)}</span>
                    {!n.read && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">New</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                  className="text-slate-300 hover:text-red-400 transition-colors shrink-0 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
