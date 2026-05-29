import { Link, useLocation } from 'react-router-dom';
import { FileText, Upload, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-blue-700">DocVault</span>
        </div>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${pathname === '/' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <Upload size={16} /> Upload
          </Link>
          <Link
            to="/documents"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${pathname === '/documents' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <FileText size={16} /> Documents
          </Link>
          <Link
            to="/notifications"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors
              ${pathname === '/notifications' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <Bell size={16} /> Notifications
          </Link>
        </nav>

        <NotificationBell />
      </div>
    </header>
  );
}
