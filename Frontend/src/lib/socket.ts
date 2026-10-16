import { io, Socket } from 'socket.io-client';

// Clean Socket.IO client interface
// The backend currently operates via high-efficiency REST endpoints with smart TanStack Query polling.
// This client layer provides a structured gateway interface for instant real-time synchronization.

let socket: Socket | null = null;

export const initSocket = (token?: string): Socket | null => {
  if (socket) return socket;

  const serverUrl = import.meta.env.VITE_WS_URL || window.location.origin;

  try {
    socket = io(serverUrl, {
      autoConnect: false,
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect_error', () => {
      // Gracefully handled; application relies on REST + Query polling
    });
  } catch {
    socket = null;
  }

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
