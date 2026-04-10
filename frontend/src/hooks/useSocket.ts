import { useEffect, useCallback } from 'react';
import { getSocket } from '../services/socket';

type EventHandler = (data: unknown) => void;

export const useSocket = (events: Record<string, EventHandler>) => {
  const connect = useCallback(() => {
    const socket = getSocket();
    Object.entries(events).forEach(([event, handler]) => {
      socket.on(event, handler);
    });
    return socket;
  }, []);

  useEffect(() => {
    const socket = connect();
    return () => {
      Object.keys(events).forEach((event) => {
        socket.off(event);
      });
    };
  }, []);
};
