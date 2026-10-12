import User from '../models/User.js';

/**
 * Presence Manager for Floveera CRM
 * Manages real-time user online/offline/away state with multi-tab support,
 * configurable disconnect grace periods, and database persistence.
 */
class PresenceManager {
  constructor() {
    // userId -> Set<socketId>
    this.userSockets = new Map();

    // socketId -> { userId, restaurantId }
    this.socketMeta = new Map();

    // userId -> { status: 'online' | 'away' | 'offline', restaurantId, lastSeenAt, lastPresenceUpdateAt }
    this.userPresence = new Map();

    // userId -> NodeJS.Timeout
    this.disconnectTimers = new Map();

    // Disconnect grace period (default 8 seconds to prevent flicker during page reload / brief network drop)
    this.gracePeriodMs = 8000;

    // Reference to Socket.IO server instance
    this.io = null;
  }

  setIo(io) {
    this.io = io;
  }

  /**
   * Called when an authenticated socket connects
   */
  handleConnection(socket, user, restaurantId) {
    const userId = user._id.toString();
    const restId = restaurantId.toString();

    // Save socket metadata
    this.socketMeta.set(socket.id, { userId, restaurantId: restId });

    // Join tenant room
    socket.join(`restaurant:${restId}`);
    socket.join(`user:${userId}`);

    // If there was a pending disconnect grace timer, cancel it immediately!
    if (this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
      this.disconnectTimers.delete(userId);
    }

    // Add socket to user's set of active sockets
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    const sockets = this.userSockets.get(userId);
    const wasAlreadyOnline = sockets.size > 0;
    sockets.add(socket.id);

    // Update presence record
    const existing = this.userPresence.get(userId);
    const now = new Date();
    this.userPresence.set(userId, {
      status: 'online',
      restaurantId: restId,
      lastSeenAt: null,
      lastPresenceUpdateAt: now
    });

    // If user just transitioned to online (was not already online with other tabs)
    if (!wasAlreadyOnline) {
      this.broadcastPresenceUpdate(restId, {
        userId,
        status: 'online',
        lastSeenAt: null,
        lastPresenceUpdateAt: now
      });
    }

    // Send immediate snapshot of current presence list to newly connected socket
    const snapshot = this.getRestaurantPresenceMap(restId);
    socket.emit('presence:sync', snapshot);
  }

  /**
   * Called when a socket disconnects
   */
  handleDisconnect(socket) {
    const meta = this.socketMeta.get(socket.id);
    if (!meta) return;

    const { userId, restaurantId } = meta;
    this.socketMeta.delete(socket.id);

    const sockets = this.userSockets.get(userId);
    if (!sockets) return;

    sockets.delete(socket.id);

    // If user still has other active sockets (other tabs or devices), do nothing!
    if (sockets.size > 0) {
      return;
    }

    // Clean up empty set
    this.userSockets.delete(userId);

    // Cancel any existing timer just in case
    if (this.disconnectTimers.has(userId)) {
      clearTimeout(this.disconnectTimers.get(userId));
    }

    // Start disconnect grace period timer
    const timer = setTimeout(async () => {
      this.disconnectTimers.delete(userId);

      // Verify that user hasn't reconnected during grace period
      if (this.userSockets.has(userId) && this.userSockets.get(userId).size > 0) {
        return;
      }

      const now = new Date();
      this.userPresence.set(userId, {
        status: 'offline',
        restaurantId,
        lastSeenAt: now,
        lastPresenceUpdateAt: now
      });

      // Persist to MongoDB
      try {
        await User.findByIdAndUpdate(userId, {
          lastSeenAt: now,
          lastPresenceUpdateAt: now
        });
      } catch (err) {
        console.error(`[PresenceManager] Failed to persist lastSeenAt for user ${userId}:`, err.message);
      }

      // Broadcast offline update to restaurant room
      this.broadcastPresenceUpdate(restaurantId, {
        userId,
        status: 'offline',
        lastSeenAt: now,
        lastPresenceUpdateAt: now
      });
    }, this.gracePeriodMs);

    this.disconnectTimers.set(userId, timer);
  }

  /**
   * Called on explicit user logout — instantly marks offline without waiting for grace period
   */
  async handleExplicitLogout(userId, restaurantId) {
    if (!userId) return;
    const uid = userId.toString();
    const restId = restaurantId ? restaurantId.toString() : null;

    // Clear any pending timer
    if (this.disconnectTimers.has(uid)) {
      clearTimeout(this.disconnectTimers.get(uid));
      this.disconnectTimers.delete(uid);
    }

    // Disconnect all sockets belonging to this user
    if (this.userSockets.has(uid)) {
      const socketIds = this.userSockets.get(uid);
      if (this.io) {
        for (const sid of socketIds) {
          const s = this.io.sockets.sockets.get(sid);
          if (s) {
            this.socketMeta.delete(sid);
            s.disconnect(true);
          }
        }
      }
      this.userSockets.delete(uid);
    }

    const now = new Date();
    this.userPresence.set(uid, {
      status: 'offline',
      restaurantId: restId,
      lastSeenAt: now,
      lastPresenceUpdateAt: now
    });

    // Persist to DB
    try {
      await User.findByIdAndUpdate(uid, {
        lastSeenAt: now,
        lastPresenceUpdateAt: now
      });
    } catch (err) {
      console.error(`[PresenceManager] Failed to persist logout for user ${uid}:`, err.message);
    }

    // Broadcast offline
    if (restId) {
      this.broadcastPresenceUpdate(restId, {
        userId: uid,
        status: 'offline',
        lastSeenAt: now,
        lastPresenceUpdateAt: now
      });
    }
  }

  /**
   * Update presence status (e.g., user is active or away)
   */
  handleStatusChange(userId, restaurantId, status) {
    const uid = userId.toString();
    const restId = restaurantId.toString();

    // Verify user is connected
    if (!this.userSockets.has(uid) || this.userSockets.get(uid).size === 0) {
      return;
    }

    const validStatus = status === 'away' ? 'away' : 'online';
    const now = new Date();

    this.userPresence.set(uid, {
      status: validStatus,
      restaurantId: restId,
      lastSeenAt: null,
      lastPresenceUpdateAt: now
    });

    this.broadcastPresenceUpdate(restId, {
      userId: uid,
      status: validStatus,
      lastSeenAt: null,
      lastPresenceUpdateAt: now
    });
  }

  /**
   * Broadcast presence update to authorized restaurant tenant room
   */
  broadcastPresenceUpdate(restaurantId, payload) {
    if (!this.io || !restaurantId) return;
    this.io.to(`restaurant:${restaurantId}`).emit('presence:update', payload);
  }

  /**
   * Get in-memory presence map for a restaurant
   */
  getRestaurantPresenceMap(restaurantId) {
    const restId = restaurantId.toString();
    const map = {};

    for (const [userId, pres] of this.userPresence.entries()) {
      if (pres.restaurantId === restId) {
        map[userId] = {
          status: pres.status,
          lastSeenAt: pres.lastSeenAt,
          lastPresenceUpdateAt: pres.lastPresenceUpdateAt
        };
      }
    }

    return map;
  }

  /**
   * Get comprehensive presence snapshot for all workers in a restaurant (combining active in-memory state with DB lastSeenAt)
   */
  async getFullPresenceList(restaurantId) {
    const restId = restaurantId.toString();
    const workers = await User.find({ restaurantId }).select('_id lastSeenAt lastPresenceUpdateAt');

    const result = {};

    for (const w of workers) {
      const uid = w._id.toString();
      const inMem = this.userPresence.get(uid);

      if (inMem && (inMem.status === 'online' || inMem.status === 'away')) {
        result[uid] = {
          status: inMem.status,
          lastSeenAt: inMem.lastSeenAt,
          lastPresenceUpdateAt: inMem.lastPresenceUpdateAt
        };
      } else {
        result[uid] = {
          status: 'offline',
          lastSeenAt: inMem?.lastSeenAt || w.lastSeenAt || null,
          lastPresenceUpdateAt: inMem?.lastPresenceUpdateAt || w.lastPresenceUpdateAt || null
        };
      }
    }

    return result;
  }
}

export const presenceManager = new PresenceManager();
export default presenceManager;
