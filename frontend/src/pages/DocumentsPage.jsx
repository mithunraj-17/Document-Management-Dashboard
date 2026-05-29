import DocumentTable from '../components/DocumentTable';

export default function DocumentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Documents</h1>
        <p className="text-slate-500 mt-1">All uploaded documents with download and management options.</p>
      </div>
      <DocumentTable refreshTrigger={0} />
    </div>
  );
}
