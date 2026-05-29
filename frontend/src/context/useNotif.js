import { useContext } from 'react';
import { NotifContext } from './notifContext.jsx';

export const useNotif = () => useContext(NotifContext);
