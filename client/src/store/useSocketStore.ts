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
    console.log('[Socket] Connecting to server...');

    socket.on('connect', () => {
      console.log('[Socket] Connected to server with ID:', socket?.id);
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      set({ isConnected: false });
    });

    socket.on('joined', (data) => {
      console.log('[Socket] Server confirmed join:', data);
    });

    socket.on('error', (data) => {
      console.error('[Socket] Server error:', data);
    });
  },

  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false, currentRoom: null });
  },

  joinAssignment: (assignmentId, callbacks) => {
    const socket: Socket | null = getSocket();
    if (!socket) {
      console.error('[Socket] Socket not connected when joining assignment');
      return;
    }

    const { currentRoom } = get();
    if (currentRoom) {
      socket.emit('leave:assignment', currentRoom);
    }

    console.log(`[Socket] Joining assignment room: ${assignmentId}`);
    socket.emit('join:assignment', assignmentId);
    set({ currentRoom: assignmentId });

    // Remove old listeners
    socket.off('generation:progress');
    socket.off('generation:complete');
    socket.off('generation:failed');

    // Add new listeners with logging
    if (callbacks.onProgress) {
      socket.on('generation:progress', (data) => {
        console.log('[Socket] Received generation:progress', data);
        callbacks.onProgress!(data);
      });
    }

    if (callbacks.onComplete) {
      socket.on('generation:complete', (data) => {
        console.log('[Socket] Received generation:complete', data);
        callbacks.onComplete!(data);
      });
    }

    if (callbacks.onFailed) {
      socket.on('generation:failed', (data) => {
        console.log('[Socket] Received generation:failed', data);
        callbacks.onFailed!(data);
      });
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
