import { create } from 'zustand';
import type { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import type { GeneratedPaper } from '@/types';

interface SocketState {
  isConnected: boolean;
  currentRoom: string | null;

  connect: () => void;
  disconnect: () => void;
  joinAssignment: (
    assignmentId: string,
    callbacks: {
      onProgress?: (data: { step: string; progress: number; message: string }) => void;
      onComplete?: (data: { paper: GeneratedPaper }) => void;
      onFailed?: (data: { error: string }) => void;
    }
  ) => void;
  leaveAssignment: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  currentRoom: null,

  connect: () => {
    const socket = connectSocket();

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });
  },

  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false, currentRoom: null });
  },

  joinAssignment: (assignmentId, callbacks) => {
    const socket: Socket | null = getSocket();
    if (!socket) return;

    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('leave:assignment', currentRoom);
    }

    socket.emit('join:assignment', assignmentId);
    set({ currentRoom: assignmentId });

    socket.off('generation:progress');
    socket.off('generation:complete');
    socket.off('generation:failed');

    if (callbacks.onProgress) {
      socket.on('generation:progress', callbacks.onProgress);
    }

    if (callbacks.onComplete) {
      socket.on('generation:complete', callbacks.onComplete);
    }

    if (callbacks.onFailed) {
      socket.on('generation:failed', callbacks.onFailed);
    }
  },

  leaveAssignment: () => {
    const socket = getSocket();
    const { currentRoom } = get();
    if (socket && currentRoom) {
      socket.emit('leave:assignment', currentRoom);
      socket.off('generation:progress');
      socket.off('generation:complete');
      socket.off('generation:failed');
    }
    set({ currentRoom: null });
  },
}));
