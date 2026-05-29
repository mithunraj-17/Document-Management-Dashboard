import { Link, useLocation } from 'react-router-dom';
import { FileText, Upload, Bell, LayoutDashboard } from 'lucide-react';
import NotificationBell from './NotificationBell';

const NAV = [
  { to: '/',              label: 'Upload',        icon: Upload },
  { to: '/documents',     label: 'Documents',     icon: LayoutDashboard },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-40"
      style={{ boxShadow: '0 1px 0 #dbeafe, 0 2px 12px rgba(37,99,235,0.07)' }}>
      <div className="max-w-7xl mx-auto px-6 h-[64px] flex items-center justify-between gap-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl hero-gradient flex items-center justify-center shadow-md shadow-blue-200">
            <FileText size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[1.25rem] font-bold tracking-tight text-blue-700">
            Doc<span className="text-slate-800">Vault</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                  ${active
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-300'
                    : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bell */}
        <NotificationBell />
      </div>
    </header>
  );
}
