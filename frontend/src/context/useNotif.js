import { useContext } from 'react';
import { NotifContext } from './NotifContext';

export const useNotif = () => useContext(NotifContext);
