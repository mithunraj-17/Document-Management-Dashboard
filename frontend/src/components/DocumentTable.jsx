import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Download, Trash2, RefreshCw, FolderOpen } from 'lucide-react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function DocumentTable({ refreshTrigger }) {
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const fetchDocs = useCallback(async () => {
    setSpinning(true);
    setLoading(true);
    try {
      const { data } = await axios.get('/api/documents');
      setDocs(data);
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 600);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs, refreshTrigger]);

  const handleDelete = async (id) => {
    await axios.delete(`/api/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="card flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-sm text-slate-400 font-medium">Loading documents…</p>
    </div>
  );

  if (!docs.length) return (
    <div className="card flex flex-col items-center justify-center py-20 gap-3">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
        <FolderOpen size={28} className="text-blue-300" strokeWidth={1.5} />
      </div>
      <p className="font-semibold text-slate-500">No documents yet</p>
      <p className="text-sm text-slate-400">Upload a PDF above to get started</p>
    </div>
  );

  return (
    <div className="card overflow-hidden fade-in">
      {/* Table header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-blue-50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800">Documents</span>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{docs.length}</span>
        </div>
        <button onClick={fetchDocs}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
          <RefreshCw size={15} className={spinning ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-slate-50 text-slate-500 text-left text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-semibold">File Name</th>
              <th className="px-6 py-3 font-semibold">Size</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Uploaded</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, i) => (
              <tr key={doc.id}
                className={`border-t border-slate-50 hover:bg-blue-50/40 transition-colors group
                  ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      <FileText size={14} className="text-blue-500" />
                    </div>
                    <span className="font-semibold text-slate-700 truncate max-w-[220px]">{doc.original_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 tabular-nums">{formatSize(doc.size)}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">PDF</span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(doc.upload_date)}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full pulse-dot" />
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <a href={`/api/documents/${doc.id}/download`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                      title="Download">
                      <Download size={15} />
                    </a>
                    <button onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
