const API_BASE = import.meta.env.VITE_API_URL || '';

// Auto-derive WS URL from API_BASE if not explicitly set
// Converts https://... → wss://... and http://... → ws://...
function getWsBase() {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.hostname}:4000`;
}

const WS_BASE = getWsBase();

export { API_BASE, WS_BASE };
