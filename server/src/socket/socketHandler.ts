import type { Server as SocketIOServer } from 'socket.io';

export function setupSocket(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:assignment', (assignmentId: string) => {
      if (!assignmentId || typeof assignmentId !== 'string') {
        socket.emit('error', { message: 'Invalid assignment ID' });
        return;
      }

      socket.join(assignmentId);
      console.log(`📋 Client ${socket.id} joined room: ${assignmentId}`);

      socket.emit('joined', {
        assignmentId,
        message: `Joined assignment room: ${assignmentId}`,
      });
    });

    socket.on('leave:assignment', (assignmentId: string) => {
      if (!assignmentId || typeof assignmentId !== 'string') {
        return;
      }

      socket.leave(assignmentId);
      console.log(`📋 Client ${socket.id} left room: ${assignmentId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (error: Error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error.message);
    });
  });

  console.log('✅ Socket.io handler initialized');
}
