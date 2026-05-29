import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import DocumentTable from '../components/DocumentTable';
import { CloudUpload, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  { icon: CloudUpload, label: 'Bulk Upload',    desc: 'Upload multiple PDFs at once' },
  { icon: Zap,         label: 'Real-time',      desc: 'Live progress for every file'  },
  { icon: ShieldCheck, label: 'Secure Storage', desc: 'Files stored safely on server' },
];

export default function UploadPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div>
      {/* Hero */}
      <div className="hero-gradient">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-2xl">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">Document Management</p>
            <h1 className="text-4xl font-black text-white leading-tight mb-3">
              Upload & Manage<br />Your PDF Documents
            </h1>
            <p className="text-blue-100 text-base mb-8">
              Drag and drop single or bulk PDF files. Track upload progress in real time and get notified when processing completes.
            </p>
            <div className="flex flex-wrap gap-4">
              {FEATURES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5">
                  <Icon size={16} className="text-blue-200 shrink-0" />
                  <div>
                    <p className="text-white text-xs font-bold">{label}</p>
                    <p className="text-blue-200 text-xs">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <UploadZone onUploadComplete={() => setRefresh(r => r + 1)} />
        <DocumentTable refreshTrigger={refresh} />
      </div>
    </div>
  );
}
