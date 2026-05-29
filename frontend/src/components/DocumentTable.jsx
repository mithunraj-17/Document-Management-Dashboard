import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FileText, Download, Trash2, RefreshCw } from 'lucide-react';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function DocumentTable({ refreshTrigger }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/documents');
      setDocs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocs(); }, [fetchDocs, refreshTrigger]);

  const handleDelete = async (id) => {
    await axios.delete(`/api/documents/${id}`);
    setDocs(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!docs.length) return (
    <div className="text-center py-16 text-slate-400">
      <FileText size={48} className="mx-auto mb-3 opacity-30" />
      <p className="font-medium">No documents uploaded yet</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <h2 className="font-semibold text-slate-700">Documents ({docs.length})</h2>
        <button onClick={fetchDocs} className="text-slate-400 hover:text-blue-500 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-left">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Size</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Uploaded</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {docs.map(doc => (
              <tr key={doc.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-400 shrink-0" />
                    <span className="font-medium text-slate-700 truncate max-w-xs">{doc.original_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500">{formatSize(doc.size)}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">PDF</span>
                </td>
                <td className="px-6 py-4 text-slate-500">{formatDate(doc.upload_date)}</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
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
