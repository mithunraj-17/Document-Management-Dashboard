import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useWS } from './WSContext';

const NotifContext = createContext(null);

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { lastMessage } = useWS();

  const fetchNotifications = useCallback(async () => {
    const { data } = await axios.get('/api/notifications');
    setNotifications(data);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (lastMessage?.event === 'notification') {
      setNotifications(prev => [lastMessage.data, ...prev]);
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

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
}

export const useNotif = () => useContext(NotifContext);
