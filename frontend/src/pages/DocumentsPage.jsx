import DocumentTable from '../components/DocumentTable';
import { LayoutDashboard } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div>
      {/* Hero */}
      <div className="hero-gradient">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest">Library</p>
          </div>
          <h1 className="text-3xl font-black text-white mt-2">All Documents</h1>
          <p className="text-blue-100 text-sm mt-1">Browse, download, or delete your uploaded PDF files.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <DocumentTable refreshTrigger={0} />
      </div>
    </div>
  );
}
