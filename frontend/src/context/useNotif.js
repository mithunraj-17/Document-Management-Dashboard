import { useContext } from 'react';
import { NotifContext } from './notifContext';

export const useNotif = () => useContext(NotifContext);
