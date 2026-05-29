const API_BASE = import.meta.env.VITE_API_URL || '';
const WS_BASE  = import.meta.env.VITE_WS_URL  || `ws://${window.location.hostname}:4000`;

export { API_BASE, WS_BASE };
