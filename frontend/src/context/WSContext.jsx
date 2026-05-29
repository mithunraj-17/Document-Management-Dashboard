import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { WS_BASE } from '../config';

const WSContext = createContext(null);

export function WSProvider({ children }) {
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(`${WS_BASE}/ws`);
      wsRef.current = ws;
      ws.onmessage = e => setLastMessage(JSON.parse(e.data));
      ws.onclose = () => setTimeout(connect, 2000);
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  return <WSContext.Provider value={{ lastMessage }}>{children}</WSContext.Provider>;
}

export const useWS = () => useContext(WSContext);
