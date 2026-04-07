import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { logger } from '../shared/logger';
import { AuthRepository } from '../modules/auth/auth.repository';

interface AuthToken {
  id: string;
  role?: string;
  [key: string]: any;
}

let io: Server | null = null;

// Map to store userId -> Set of socketIds
const userSocketMap = new Map<string, Set<string>>();

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Configure this based on your env/requirements
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication Middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        logger.warn(`Socket connection rejected: No token provided. ID: ${socket.id}`);
        return next(new Error('Authentication failed: No token provided'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as AuthToken;

      // Fetch full user details to get the name
      const user = await AuthRepository.getUserProfileById(decoded.id);

      if (!user) {
        logger.warn(`Socket connection rejected: User not found. ID: ${socket.id}`);
        return next(new Error('Authentication failed: User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      logger.warn(`Socket connection rejected: Invalid token. ID: ${socket.id}`);
      return next(new Error('Authentication failed: Invalid token'));
    }
  });

  // Internal namespace for service-to-service communication (e.g., from vDrive-User-Driver-API)
  const internalNamespace = io.of('/internal');
  internalNamespace.use((socket: Socket, next: (err?: any) => void) => {
    const token = socket.handshake.auth.token;
    if (token && token === config.internalServiceSecret) {
      next();
    } else {
      logger.warn(`Internal socket connection rejected: Invalid or missing token. ID: ${socket.id}`);
      next(new Error('Authentication failed: Invalid internal token'));
    }
  });

  internalNamespace.on('connection', (socket: Socket) => {
    logger.info(`🔌 Internal service socket connected: ${socket.id}`);

    // Listen for events from internal services
    socket.on('driver_event', (data: any) => {
      logger.info('Received driver event via internal socket:', data);
      // You can broadcast this to all admin users if needed
      io?.emit('driver_event', { ...data, timestamp: new Date().toISOString() });
    });

    socket.on('disconnect', (reason: string) => {
      logger.info(`❌ Internal service socket disconnected: ${socket.id}. Reason: ${reason}`);
    });
  });

  io.on('connection', (socket: Socket) => {
    const userName = socket.data.user?.name || 'Unknown';
    const userId = socket.data.user?.id || 'Unknown';

    // Add to user map
    if (userId !== 'Unknown') {
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId)?.add(socket.id);
    }

    logger.info(`🔌 Socket connected: ${socket.id} (User: ${userName} | ID: ${userId})`);

    socket.on('disconnect', (reason) => {
      // Remove from user map
      if (userId !== 'Unknown') {
        const userSockets = userSocketMap.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(userId);
          }
        }
      }
      logger.info(`❌ Socket disconnected: ${socket.id} (User: ${userName}). Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error (${socket.id}):`, error);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.IO not initialized!');
  }
  return io;
};

/**
 * Send a message to a specific user (all their active sockets).
 * @param userId - The ID of the user to send the message to.
 * @param event - The event name.
 * @param data - The data to send.
 */
export const sendToUser = (userId: string, event: string, data: any) => {
  if (!io) return;

  const socketIds = userSocketMap.get(userId);
  if (socketIds && socketIds.size > 0) {
    logger.info(`Sending '${event}' to User ${userId} (${socketIds.size} active sockets)`);
    socketIds.forEach((socketId) => {
      io?.to(socketId).emit(event, data);
    });
  } else {
    logger.warn(`Attempted to send '${event}' to User ${userId}, but no active sockets found.`);
  }
};

/**
 * Send a message to a specific socket ID.
 * @param socketId - The specific socket ID.
 * @param event - The event name.
 * @param data - The data to send.
 */
export const sendToSocket = (socketId: string, event: string, data: any) => {
  if (!io) return;
  logger.info(`Sending '${event}' to Socket ${socketId}`);
  io.to(socketId).emit(event, data);
};
