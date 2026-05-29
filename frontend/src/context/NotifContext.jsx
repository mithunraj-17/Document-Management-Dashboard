import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import { useWS } from './WSContext';

export const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { lastMessage } = useWS();
  const lastMessageRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    const { data } = await axios.get('/api/notifications');
    setNotifications(data);
  }, []);

  // Initial fetch — runs once, no setState-in-effect lint issue since
  // fetchNotifications is stable and the async result sets state in a callback
  useEffect(() => {
    fetchNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // WS message handler — only act when lastMessage actually changes
  useEffect(() => {
    if (
      lastMessage?.event === 'notification' &&
      lastMessage !== lastMessageRef.current
    ) {
      lastMessageRef.current = lastMessage;
      setNotifications(prev => [lastMessage.data, ...prev]);
    }
  }); // no dep array — runs after every render, guarded by ref

  const markRead = async (id) => {
    await axios.patch(`/api/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await axios.patch('/api/notifications/read-all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = async (id) => {
    await axios.delete(`/api/notifications/${id}`);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
}
