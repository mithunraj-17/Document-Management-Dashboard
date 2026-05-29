import { useState } from 'react';
import UploadZone from '../components/UploadZone';
import DocumentTable from '../components/DocumentTable';

export default function UploadPage() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Upload Documents</h1>
        <p className="text-slate-500 mt-1">Upload single or multiple PDF files. Bulk uploads (4+) are processed in the background.</p>
      </div>
      <UploadZone onUploadComplete={() => setRefresh(r => r + 1)} />
      <DocumentTable refreshTrigger={refresh} />
    </div>
  );
}
