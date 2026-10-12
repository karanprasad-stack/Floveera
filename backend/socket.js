import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import { normalizeRestaurantRole } from './middleware/restaurantAuth.js';
import { getOrCreateDefaultRestaurant } from './utils/restaurantHelper.js';
import { presenceManager } from './utils/presenceManager.js';

const JWT_SECRET = process.env.JWT_SECRET || 'floveera_secure_session_secret_jwt_2026';

function parseCookieHeader(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const [rawName, ...rawVal] = part.split('=');
    const name = rawName?.trim();
    if (!name) continue;
    try {
      cookies[name] = decodeURIComponent(rawVal.join('=').trim());
    } catch {
      cookies[name] = rawVal.join('=').trim();
    }
  }
  return cookies;
}

export function initSocketServer(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true
    },
    pingTimeout: 20000,
    pingInterval: 10000
  });

  presenceManager.setIo(io);

  // Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookieHeader(socket.handshake.headers.cookie);
      let token = cookies.crm_auth_token || cookies.auth_token;

      // Also check handshake auth or headers
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }
      if (!token && socket.handshake.headers.authorization?.startsWith('Bearer ')) {
        token = socket.handshake.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return next(new Error('Authentication required for real-time presence'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id || decoded.userId;

      if (!userId) {
        return next(new Error('Invalid authentication token payload'));
      }

      const user = await User.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
        return next(new Error('Account disabled'));
      }

      // Role check: Only CRM-authorized personnel (admin, worker, manager, owner)
      const role = normalizeRestaurantRole(user);
      if (!role) {
        return next(new Error('Access denied: User is not authorized for CRM operations'));
      }

      // Resolve restaurant
      let restaurantId = user.restaurantId;
      if (!restaurantId) {
        const defaultRest = await getOrCreateDefaultRestaurant();
        restaurantId = defaultRest._id;
        user.restaurantId = restaurantId;
        await user.save();
      }

      // Attach to socket data
      socket.data.user = user;
      socket.data.restaurantId = restaurantId;
      next();
    } catch (err) {
      console.warn('[Socket Auth Error]:', err.message);
      return next(new Error('Authentication failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    const restaurantId = socket.data.restaurantId;

    // Connect into presence manager
    presenceManager.handleConnection(socket, user, restaurantId);

    // Client requests status change (e.g. away or online)
    socket.on('presence:status', (payload) => {
      try {
        const newStatus = payload?.status === 'away' ? 'away' : 'online';
        presenceManager.handleStatusChange(user._id, restaurantId, newStatus);
      } catch (e) {
        console.error('Error handling presence:status:', e.message);
      }
    });

    // Client explicitly requests a full sync
    socket.on('presence:request_sync', () => {
      try {
        const snapshot = presenceManager.getRestaurantPresenceMap(restaurantId);
        socket.emit('presence:sync', snapshot);
      } catch (e) {
        console.error('Error handling presence:request_sync:', e.message);
      }
    });

    // Socket disconnection
    socket.on('disconnect', (reason) => {
      presenceManager.handleDisconnect(socket);
    });
  });

  return io;
}
