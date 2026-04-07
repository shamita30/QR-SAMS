import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  roomId: string;
  userId: string;
  name: string;
  role: string;
  text: string;
  timestamp: string;
  status: 'SENT' | 'READ';
}

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  messages: Record<string, Message[]>; // roomId -> messages
  initSocket: (userId: string) => void;
  joinRoom: (roomId: string) => void;
  sendMessage: (roomId: string, userId: string, userName: string, userRole: string, text: string) => void;
  markAsRead: (messageId: string, roomId: string) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: new Set(),
  messages: {},

  initSocket: (userId: string) => {
    if (get().socket) return;

    const wsUrl = window.location.port === '3000' 
      ? `http://${window.location.hostname}:3001`
      : window.location.origin;
      
    const socket = io(wsUrl);

    socket.on('connect', () => {
      set({ isConnected: true, socket });
      socket.emit('USER_ONLINE', userId);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('USER_STATUS_CHANGE', ({ userId, status }) => {
      set((state) => {
        const newOnline = new Set(state.onlineUsers);
        if (status === 'ONLINE') newOnline.add(userId);
        else newOnline.delete(userId);
        return { onlineUsers: newOnline };
      });
    });

    socket.on('NEW_MESSAGE', (msg: Message) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [msg.roomId]: [...(state.messages[msg.roomId] || []), msg],
        },
      }));
    });

    socket.on('MESSAGE_READ', ({ messageId }) => {
      set((state) => {
        const newMessages = { ...state.messages };
        for (const roomId in newMessages) {
          newMessages[roomId] = newMessages[roomId].map((m) =>
            m.id === messageId ? { ...m, status: 'READ' } : m
          );
        }
        return { messages: newMessages };
      });
    });

    set({ socket });
  },

  joinRoom: (roomId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('JOIN_ROOM', roomId);
    }
  },

  sendMessage: (roomId, userId, userName, userRole, text) => {
    const { socket } = get();
    if (socket) {
      socket.emit('SEND_MESSAGE', { roomId, userId, userName, userRole, text });
    }
  },

  markAsRead: (messageId, roomId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('MARK_READ', { messageId, roomId });
    }
  },
}));
