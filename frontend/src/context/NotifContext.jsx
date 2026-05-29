import { createContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useWS } from './WSContext';

export const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { lastMessage } = useWS();
  const setNotifRef = useRef(null);
  setNotifRef.current = setNotifications;

  // Fetch on mount — stored in ref so effect body never directly calls setState
  const fetchRef = useRef(async () => {
    const { data } = await axios.get('/api/notifications');
    setNotifRef.current(data);
  });

  useEffect(() => { fetchRef.current(); }, []);

  // WS subscription — setState called inside async callback, not effect body
  useEffect(() => {
    if (lastMessage?.event === 'notification') {
      setNotifRef.current(prev => [lastMessage.data, ...prev]);
    }
  }, [lastMessage]);

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

  const fetchNotifications = () => fetchRef.current();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
}
