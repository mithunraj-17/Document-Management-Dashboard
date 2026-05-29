import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, X, CheckCircle, AlertCircle, ChevronDown, ChevronUp, CloudUpload } from 'lucide-react';

const STATUS_COLORS = {
  pending:   'text-slate-400',
  uploading: 'text-blue-500',
  complete:  'text-emerald-500',
  failed:    'text-red-500',
};

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onUploadComplete }) {
  const [files, setFiles]       = useState([]);
  const [dragging, setDragging] = useState(false);
  const [bulkToast, setBulkToast] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef();

  const addFiles = (newFiles) => {
    const pdfs = Array.from(newFiles).filter(f => f.type === 'application/pdf');
    if (!pdfs.length) return;
    const entries = pdfs.map(f => ({
      id: crypto.randomUUID(), file: f, name: f.name,
      size: f.size, progress: 0, status: 'pending',
    }));
    setFiles(prev => [...prev, ...entries]);
    uploadFiles(entries);
  };

  const uploadFiles = async (entries) => {
    if (entries.length > 3) {
      setBulkToast(`Processing ${entries.length} files in background…`);
      setCollapsed(true);
    }
    const formData = new FormData();
    entries.forEach(e => formData.append('files', e.file));
    setFiles(prev => prev.map(f =>
      entries.find(e => e.id === f.id) ? { ...f, status: 'uploading' } : f
    ));
    const intervals = entries.map((entry, i) => {
      let prog = 0;
      return setInterval(() => {
        prog = Math.min(prog + Math.random() * 15 + 5, 90);
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, progress: Math.round(prog) } : f));
      }, 200 + i * 50);
    });
    try {
      await axios.post('/api/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      intervals.forEach(clearInterval);
      setFiles(prev => prev.map(f =>
        entries.find(e => e.id === f.id) ? { ...f, progress: 100, status: 'complete' } : f
      ));
      setBulkToast(null);
      onUploadComplete?.();
    } catch {
      intervals.forEach(clearInterval);
      setFiles(prev => prev.map(f =>
        entries.find(e => e.id === f.id) ? { ...f, status: 'failed' } : f
      ));
    }
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const clearAll   = () => setFiles([]);

  return (
    <div className="space-y-4">

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
          ${dragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/50'}`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative py-14 px-8 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center transition-all duration-200
            ${dragging ? 'hero-gradient shadow-lg shadow-blue-300' : 'bg-blue-100'}`}>
            <CloudUpload size={30} className={dragging ? 'text-white' : 'text-blue-500'} strokeWidth={1.8} />
          </div>
          <p className="text-lg font-bold text-slate-800 mb-1">
            {dragging ? 'Release to upload' : 'Drop PDF files here'}
          </p>
          <p className="text-sm text-slate-400 mb-4">or click to browse from your computer</p>
          <span className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm shadow-blue-300 pointer-events-none">
            <Upload size={14} /> Browse Files
          </span>
          <p className="text-xs text-slate-300 mt-4">PDF only · Max 50 MB per file · Bulk upload supported</p>
        </div>
        <input ref={inputRef} type="file" accept=".pdf" multiple className="hidden"
          onChange={e => addFiles(e.target.files)} />
      </div>

      {/* Bulk Toast */}
      {bulkToast && (
        <div className="fade-in flex items-center gap-3 hero-gradient text-white px-5 py-3.5 rounded-2xl shadow-lg shadow-blue-300">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm">Upload in progress</p>
            <p className="text-xs text-blue-100">{bulkToast}</p>
          </div>
          <button onClick={() => setCollapsed(c => !c)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="card overflow-hidden fade-in">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-50">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full flex items-center justify-center">
                {files.length}
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {files.length} file{files.length > 1 ? 's' : ''} queued
              </span>
            </div>
            <div className="flex items-center gap-3">
              {files.length > 3 && (
                <button onClick={() => setCollapsed(c => !c)}
                  className="text-slate-400 hover:text-blue-500 transition-colors">
                  {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              )}
              <button onClick={clearAll}
                className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors">
                Clear all
              </button>
            </div>
          </div>

          {!collapsed && (
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {files.map(f => (
                <div key={f.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-blue-50/30 transition-colors">
                  {/* File icon */}
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-blue-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-[260px]">{f.name}</span>
                      <span className={`text-xs font-bold ml-2 shrink-0 ${STATUS_COLORS[f.status]}`}>
                        {f.status === 'uploading' ? `${f.progress}%` : f.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300
                            ${f.status === 'failed'   ? 'bg-red-400' :
                              f.status === 'complete' ? 'bg-emerald-400' :
                              f.status === 'uploading' ? 'progress-shimmer' : 'bg-blue-300'}`}
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0 tabular-nums">{formatSize(f.size)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 w-6 flex items-center justify-center">
                    {f.status === 'complete'  && <CheckCircle size={18} className="text-emerald-500" />}
                    {f.status === 'failed'    && <AlertCircle size={18} className="text-red-500" />}
                    {f.status === 'uploading' && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                    {f.status === 'pending'   && (
                      <button onClick={() => removeFile(f.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {collapsed && (
            <div className="px-5 py-3 flex items-center gap-2 text-sm text-slate-500">
              <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="h-1.5 bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((files.filter(f => f.status === 'complete').length / files.length) * 100)}%` }} />
              </div>
              <span className="shrink-0 text-xs font-semibold text-blue-600">
                {files.filter(f => f.status === 'complete').length}/{files.length} done
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
