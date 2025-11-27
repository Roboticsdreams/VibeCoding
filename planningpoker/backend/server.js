const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Throttling and event queue management
class EventThrottler {
  constructor() {
    this.eventQueues = new Map();
    this.processingStatus = new Map();
  }

  // Add event to queue
  queueEvent(roomId, eventName, eventData) {
    const queueKey = `${roomId}:${eventName}`;
    if (!this.eventQueues.has(queueKey)) {
      this.eventQueues.set(queueKey, []);
    }
    
    this.eventQueues.get(queueKey).push(eventData);
    return this.processQueue(roomId, eventName);
  }

  // Process queue for a specific room and event
  async processQueue(roomId, eventName) {
    const queueKey = `${roomId}:${eventName}`;
    
    // If already processing, just return
    if (this.processingStatus.get(queueKey)) {
      return;
    }
    
    this.processingStatus.set(queueKey, true);
    
    // Get queue
    const queue = this.eventQueues.get(queueKey) || [];
    
    // If queue is empty, mark as not processing
    if (queue.length === 0) {
      this.processingStatus.set(queueKey, false);
      return null;
    }
    
    // Get latest event
    const latestEvent = queue.pop();
    
    // Clear queue (we only care about most recent)
    queue.length = 0;
    
    // Delay before completing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mark as not processing
    this.processingStatus.set(queueKey, false);
    
    return latestEvent;
  }
}

// Create throttler instance
const eventThrottler = new EventThrottler();

const app = express();
const server = http.createServer(app);

// Increase timeouts
server.timeout = 120000; // 2 minutes

// Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: true, // Allow any origin dynamically
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'] // Support both transport types
});

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/jira', require('./routes/jira'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    
    // Get user email from database since it's not stored in the JWT anymore
    try {
      const pool = require('./db/config');
      const result = await pool.query('SELECT email FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
        return next(new Error('User not found'));
      }
      
      socket.userId = decoded.id;
      socket.userEmail = result.rows[0].email;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);

  // Join room
  socket.on('join-room', (roomId) => {
    socket.join(`room-${roomId}`);
    console.log(`User ${socket.userId} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(`room-${roomId}`).emit('user-joined', {
      userId: socket.userId,
      email: socket.userEmail
    });
  });

  // Leave room
  socket.on('leave-room', (roomId) => {
    socket.leave(`room-${roomId}`);
    console.log(`User ${socket.userId} left room ${roomId}`);
    
    // Notify others in the room
    socket.to(`room-${roomId}`).emit('user-left', {
      userId: socket.userId,
      email: socket.userEmail
    });
  });

  // Task activated - with delay for non-admins
  socket.on('task-activated', async (data) => {
    const { roomId, task } = data;
    
    try {
      const pool = require('./db/config');
      
      console.log(`Task activation request received for task ${task.id} in room ${roomId}`);
      
      // Update the task in the database to ensure it's really active
      await pool.query(
        `UPDATE tasks 
         SET is_active = TRUE, status = 'active', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [task.id]
      );
      
      // Deactivate all other tasks in the room
      await pool.query(
        `UPDATE tasks 
         SET is_active = FALSE 
         WHERE room_id = $1 AND id != $2`,
        [roomId, task.id]
      );
      
      // Get fresh task data
      const freshTaskResult = await pool.query(
        `SELECT * FROM tasks WHERE id = $1`,
        [task.id]
      );
      
      if (freshTaskResult.rows.length === 0) {
        throw new Error('Task not found after activation');
      }
      
      const freshTask = freshTaskResult.rows[0];
      
      // CRITICAL: Send to ALL users immediately to ensure everyone sees the active task change
      // Use direct broadcast to ALL clients in the room
      console.log(`Broadcasting task-activated to all users in room-${roomId} for task ${freshTask.id}`);
      io.in(`room-${roomId}`).emit('task-activated', freshTask);
      
      // Send a duplicate event to make absolutely sure all clients receive it
      setTimeout(() => {
        console.log(`Re-broadcasting task-activated to room-${roomId} for task ${freshTask.id}`);
        io.in(`room-${roomId}`).emit('task-activated', freshTask);
      }, 100);
      
      // Force multiple refreshes at different intervals to ensure all clients update
      // First quick refresh
      setTimeout(() => {
        io.in(`room-${roomId}`).emit('force-refresh', {
          taskId: freshTask.id,
          action: 'task-activated',
          timestamp: new Date().toISOString()
        });
      }, 300);
      
      // Second refresh with different parameters
      setTimeout(() => {
        io.in(`room-${roomId}`).emit('force-refresh', {
          taskId: freshTask.id,
          action: 'task-activated-confirm',
          timestamp: new Date().toISOString()
        });
      }, 1000);
      
      console.log(`Force refresh scheduled for task ${task.id} activation`);
    } catch (error) {
      console.error('Error in task-activated event:', error);
    }
  });
  
  // Direct refresh all - special event to force refresh all clients in a room
  socket.on('direct-refresh-all', async (data) => {
    const { roomId, taskId, action, timestamp } = data;
    
    try {
      console.log(`Direct refresh request for all users in room ${roomId}, action: ${action}`);
      
      // Get the latest active task
      const pool = require('./db/config');
      const activeTaskResult = await pool.query(
        'SELECT * FROM tasks WHERE room_id = $1 AND is_active = TRUE',
        [roomId]
      );
      
      const activeTask = activeTaskResult.rows[0];
      
      if (!activeTask) {
        console.log(`No active task found in room ${roomId}`);
        return;
      }
      
      console.log(`Broadcasting active task ${activeTask.id} to all users in room ${roomId}`);
      
      // First emit task activated
      io.in(`room-${roomId}`).emit('task-activated', activeTask);
      
      // Then force a refresh
      setTimeout(() => {
        io.in(`room-${roomId}`).emit('force-refresh', {
          taskId: activeTask.id,
          action: 'task-activated',
          timestamp: new Date().toISOString()
        });
      }, 300);
      
    } catch (error) {
      console.error('Error in direct-refresh-all event:', error);
    }
  });

  // Task deactivated
  socket.on('task-deactivated', (data) => {
    const { roomId, taskId } = data;
    socket.to(`room-${roomId}`).emit('task-deactivated', { taskId });
    console.log(`Task ${taskId} deactivated in room ${roomId}`);
  });

  // Vote submitted - ensure all clients receive the update with accurate vote counts
  socket.on('vote-submitted', async (data) => {
    const { roomId, taskId, voteCount } = data;
    
    try {
      const pool = require('./db/config');
      
      // Get user info for logging and client identification
      let userName = '';
      try {
        const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [socket.userId]);
        if (userResult.rows.length > 0) {
          userName = userResult.rows[0].name;
        }
      } catch (userError) {
        console.error('Error getting user info:', userError);
      }
      
      // Get the current actual vote count to ensure accuracy
      const votesQuery = `SELECT COUNT(*) as count FROM votes WHERE task_id = $1`;
      const votesResult = await pool.query(votesQuery, [taskId]);
      const actualVoteCount = parseInt(votesResult.rows[0].count || 0);
      
      console.log(`Actual vote count from database after submission: ${actualVoteCount}`);
      console.log(`Client reported vote count: ${voteCount}, database shows: ${actualVoteCount}`);
      
      if (voteCount !== actualVoteCount) {
        console.warn(`Vote count mismatch: client reported ${voteCount} but database shows ${actualVoteCount}`);
      }
      
      // Always broadcast immediately to all clients in the room with accurate count
      // This ensures real-time vote count updates
      io.in(`room-${roomId}`).emit('vote-submitted', {
        taskId,
        voteCount: actualVoteCount, // Use the actual count from database
        userId: socket.userId,
        userName: userName,
        timestamp: new Date().toISOString() // Add timestamp to help clients avoid race conditions
      });
      
      console.log(`Vote submitted for task ${taskId} by user ${userName || socket.userId} - broadcast to all users with count ${actualVoteCount}`);
      
      // Force update task data in room
      await pool.query(
        `UPDATE tasks 
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [taskId]
      );
      
      // Also update the vote timestamp separately
      await pool.query(
        `UPDATE votes
         SET voted_at = CURRENT_TIMESTAMP 
         WHERE task_id = $1 AND user_id = $2`,
        [taskId, socket.userId]
      );
      
      // Vote submitted event - Send a separate direct update to all clients after a short delay
      // This helps ensure everyone gets the update even if they missed the first broadcast
      setTimeout(() => {
        io.to(`room-${roomId}`).emit('force-refresh', {
          taskId,
          action: 'vote-submitted',
          userId: socket.userId,
          userName: userName || socket.userId,
          timestamp: new Date().toISOString()
        });
      }, 500);
      
      console.log(`Updated task ${taskId} and vote timestamps`);
    } catch (error) {
      console.error('Error in vote-submitted event:', error);
    }
  });

  // Vote deleted - ensure all clients receive the update
  socket.on('vote-deleted', async (data) => {
    const { roomId, taskId, voteCount } = data;
    
    try {
      const pool = require('./db/config');
      
      // Get user info for logging and client identification
      let userName = '';
      try {
        const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [socket.userId]);
        if (userResult.rows.length > 0) {
          userName = userResult.rows[0].name;
        }
      } catch (userError) {
        console.error('Error getting user info:', userError);
      }
      
      // Get the current actual vote count to ensure accuracy
      const votesQuery = `SELECT COUNT(*) as count FROM votes WHERE task_id = $1`;
      const votesResult = await pool.query(votesQuery, [taskId]);
      const actualVoteCount = parseInt(votesResult.rows[0].count || 0);
      
      console.log(`Actual vote count from database after deletion: ${actualVoteCount}`);
      
      // Broadcast to all clients in the room
      io.to(`room-${roomId}`).emit('vote-deleted', {
        taskId,
        voteCount: actualVoteCount, // Use the actual count from database
        userId: socket.userId,
        userName: userName,
        timestamp: new Date().toISOString() // Add timestamp to help clients avoid race conditions
      });
      
      console.log(`Vote deleted for task ${taskId} by user ${userName || socket.userId} - broadcast to all users`);
      
      // Force update task data in room
      await pool.query(
        `UPDATE tasks 
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [taskId]
      );
      
      // Vote deleted event - Send a separate direct update to all clients after a short delay
      // This helps ensure everyone gets the update even if they missed the first broadcast
      setTimeout(() => {
        io.to(`room-${roomId}`).emit('force-refresh', {
          taskId,
          action: 'vote-deleted',
          userId: socket.userId,
          userName: userName || socket.userId,
          timestamp: new Date().toISOString()
        });
      }, 500);
      
      console.log(`Updated task ${taskId} timestamp after vote deletion`);
    } catch (error) {
      console.error('Error in vote-deleted event:', error);
    }
  });

  // Votes revealed
  socket.on('votes-revealed', async (data) => {
    const { roomId, taskId, votes, statistics } = data;
    try {
      const pool = require('./db/config');
      
      // Update the task to mark votes as revealed
      await pool.query(
        `UPDATE tasks 
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [taskId]
      );
      
      // Broadcast to all clients in the room
      io.to(`room-${roomId}`).emit('votes-revealed', {
        taskId,
        votes,
        statistics,
        timestamp: new Date().toISOString()
      });
      
      // Send a separate direct update to all clients after a short delay
      setTimeout(() => {
        io.to(`room-${roomId}`).emit('force-refresh', {
          taskId,
          timestamp: new Date().toISOString()
        });
      }, 1000);
      
      console.log(`Votes revealed for task ${taskId} in room ${roomId}`);
    } catch (error) {
      console.error('Error in votes-revealed event:', error);
    }
  });

  // Task updated
  socket.on('task-updated', (data) => {
    const { roomId, task } = data;
    socket.to(`room-${roomId}`).emit('task-updated', task);
    console.log(`Task ${task.id} updated in room ${roomId}`);
  });

  // Task created
  socket.on('task-created', (data) => {
    const { roomId, task } = data;
    socket.to(`room-${roomId}`).emit('task-created', task);
    console.log(`Task ${task.id} created in room ${roomId}`);
  });

  // Task deleted
  socket.on('task-deleted', (data) => {
    const { roomId, taskId } = data;
    socket.to(`room-${roomId}`).emit('task-deleted', { taskId });
    console.log(`Task ${taskId} deleted in room ${roomId}`);
  });

  // Participant added
  socket.on('participant-added', (data) => {
    const { roomId, participant } = data;
    socket.to(`room-${roomId}`).emit('participant-added', participant);
    console.log(`Participant added to room ${roomId}`);
  });

  // Participant removed
  socket.on('participant-removed', (data) => {
    const { roomId, userId } = data;
    socket.to(`room-${roomId}`).emit('participant-removed', { userId });
    console.log(`Participant ${userId} removed from room ${roomId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;

// Get network interfaces for better logging
const { networkInterfaces } = require('os');
const getNetworkAddresses = () => {
  const interfaces = networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!iface.internal && iface.family === 'IPv4') {
        addresses.push({
          name: name,
          address: iface.address
        });
      }
    }
  }
  return addresses;
};

// Listen on all interfaces with explicit host parameter
const HOST = process.env.HOST || '0.0.0.0';
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for real-time connections`);
  
  const addresses = getNetworkAddresses();
  console.log(`\n🔗 Server accessible via:`);
  addresses.forEach(({ name, address }) => {
    console.log(`   - http://${address}:${PORT} (${name})`);
  });
});

module.exports = { app, server, io };
