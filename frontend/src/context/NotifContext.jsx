import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useWS } from './WSContext';
import { NotifContext } from './notifContext';

export function NotifProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { lastMessage } = useWS();
  const lastHandledRef = useRef(null);

  useEffect(() => {
    axios.get('/api/notifications').then(({ data }) => setNotifications(data));
  }, []);

  useEffect(() => {
    if (lastMessage?.event === 'notification' && lastMessage !== lastHandledRef.current) {
      lastHandledRef.current = lastMessage;
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

  const fetchNotifications = () =>
    axios.get('/api/notifications').then(({ data }) => setNotifications(data));

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, deleteNotif, fetchNotifications }}>
      {children}
    </NotifContext.Provider>
  );
}
