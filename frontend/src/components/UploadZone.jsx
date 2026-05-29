import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'text-slate-400',
  uploading: 'text-blue-500',
  complete: 'text-green-500',
  failed: 'text-red-500',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [bulkToast, setBulkToast] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    if (!pdfs.length) return;
    const entries = pdfs.map(f => ({
      id: crypto.randomUUID(),
      file: f,
      name: f.name,
      size: f.size,
      progress: 0,
      status: 'pending',
    }));
    setFiles(prev => [...prev, ...entries]);
    uploadFiles(entries);
  };

  const uploadFiles = async (entries) => {
    if (entries.length > 3) {
      setBulkToast(`Upload in progress — processing ${entries.length} files in background.`);
      setCollapsed(true);
    }

    const formData = new FormData();
    entries.forEach(e => formData.append('files', e.file));

    // Mark all as uploading
    setFiles(prev => prev.map(f =>
      entries.find(e => e.id === f.id) ? { ...f, status: 'uploading' } : f
    ));

    // Simulate per-file progress using intervals
    const intervals = entries.map((entry, i) => {
      let prog = 0;
      return setInterval(() => {
        prog = Math.min(prog + Math.random() * 15 + 5, 90);
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, progress: Math.round(prog) } : f));
      }, 200 + i * 50);
    });

    try {
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      intervals.forEach(clearInterval);
      setFiles(prev => prev.map(f =>
        entries.find(e => e.id === f.id) ? { ...f, progress: 100, status: 'complete' } : f
      ));

      if (entries.length > 3) {
        setBulkToast(null);
      }

      onUploadComplete?.();
    } catch {
      intervals.forEach(clearInterval);
      setFiles(prev => prev.map(f =>
        entries.find(e => e.id === f.id) ? { ...f, status: 'failed' } : f
      ));
    }
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all
          ${dragging ? 'border-blue-500 bg-blue-50' : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
      >
        <Upload className="mx-auto mb-3 text-blue-400" size={40} />
        <p className="text-lg font-semibold text-blue-700">Drop PDF files here or click to browse</p>
        <p className="text-sm text-slate-400 mt-1">Supports single or bulk PDF uploads · Max 50MB per file</p>
        <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      {/* Bulk Toast */}
      {bulkToast && (
        <div className="flex items-center gap-3 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="font-medium">{bulkToast}</span>
          <button className="ml-auto" onClick={() => setCollapsed(c => !c)}>
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-700">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
            <div className="flex gap-2">
              {files.length > 3 && (
                <button onClick={() => setCollapsed(c => !c)} className="text-slate-400 hover:text-blue-500 transition-colors">
                  {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
              )}
              <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
            </div>
          </div>

          {!collapsed && (
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto scrollbar-thin">
              {files.map(f => (
                <div key={f.id} className="px-5 py-3 flex items-center gap-4">
                  <FileText size={20} className="text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate max-w-xs">{f.name}</span>
                      <span className={`text-xs font-semibold ml-2 shrink-0 ${STATUS_COLORS[f.status]}`}>
                        {f.status === 'uploading' ? `${f.progress}%` : f.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            f.status === 'failed' ? 'bg-red-400' :
                            f.status === 'complete' ? 'bg-green-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">{formatSize(f.size)}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {f.status === 'complete' && <CheckCircle size={18} className="text-green-500" />}
                    {f.status === 'failed' && <AlertCircle size={18} className="text-red-500" />}
                    {(f.status === 'pending' || f.status === 'failed') && (
                      <button onClick={() => removeFile(f.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <X size={18} />
                      </button>
                    )}
                    {f.status === 'uploading' && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {collapsed && (
            <div className="px-5 py-3 text-sm text-slate-500">
              {files.filter(f => f.status === 'complete').length} / {files.length} files processed
            </div>
          )}
        </div>
      )}
    </div>
  );
}
