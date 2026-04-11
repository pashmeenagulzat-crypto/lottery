import { useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

type EventHandler = (data: unknown) => void;

export const useSocket = (events: Record<string, EventHandler>) => {
  // Keep latest handlers in a ref to avoid stale closures without
  // triggering reconnect on every render when the events object changes.
  const handlersRef = useRef<Record<string, EventHandler>>(events);
  handlersRef.current = events;

  useEffect(() => {
    const socket = getSocket();
    const eventNames = Object.keys(handlersRef.current);

    eventNames.forEach((event) => {
      socket.on(event, (data: unknown) => handlersRef.current[event]?.(data));
    });

    return () => {
      eventNames.forEach((event) => socket.off(event));
    };
  }, []);
};
