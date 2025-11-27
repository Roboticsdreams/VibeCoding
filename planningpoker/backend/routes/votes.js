const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');
const { hasRoomAccess, isRoomAdmin, isRoomAdminOrCreator } = require('../utils/helpers');

// Submit or update vote
router.post('/', authenticateToken,
  [
    body('taskId').isInt(),
    body('estimate').isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { taskId, estimate } = req.body;

      // Get task and check if active
      const taskResult = await pool.query(
        'SELECT room_id, is_active FROM tasks WHERE id = $1',
        [taskId]
      );

      if (taskResult.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const task = taskResult.rows[0];

      if (!task.is_active) {
        return res.status(400).json({ error: 'Task is not active for voting' });
      }

      // Check room access
      const access = await hasRoomAccess(pool, req.user.id, task.room_id);
      if (!access) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Insert or update vote
      const result = await pool.query(
        `INSERT INTO votes (task_id, user_id, estimate) 
         VALUES ($1, $2, $3)
         ON CONFLICT (task_id, user_id) 
         DO UPDATE SET estimate = $3, voted_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [taskId, req.user.id, estimate]
      );

      res.json({
        message: 'Vote submitted successfully',
        vote: result.rows[0]
      });
    } catch (error) {
      console.error('Submit vote error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get user's vote for a task
router.get('/task/:taskId/my-vote', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task
    const taskResult = await pool.query(
      'SELECT room_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check room access
    const access = await hasRoomAccess(pool, req.user.id, taskResult.rows[0].room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get vote
    const result = await pool.query(
      'SELECT * FROM votes WHERE task_id = $1 AND user_id = $2',
      [taskId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No vote found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get vote error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get vote count only for a task
router.get('/task/:taskId/count', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task
    const taskResult = await pool.query(
      'SELECT room_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check room access
    const access = await hasRoomAccess(pool, req.user.id, taskResult.rows[0].room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get count of votes
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM votes WHERE task_id = $1',
      [taskId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get vote count error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get voting status of all participants for a task
router.get('/task/:taskId/status', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const noCache = req.query.noCache === 'true'; // Allow client to bypass cache

    // Add cache busting headers to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Get task to check room
    const taskResult = await pool.query(
      'SELECT room_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const roomId = taskResult.rows[0].room_id;

    // Check room access
    const access = await hasRoomAccess(pool, req.user.id, roomId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if admin for full details
    const isAdmin = await isRoomAdmin(pool, req.user.id, roomId);

    // Use a more direct approach to check voting status
    // First get a count of actual votes for this task
    const voteCountQuery = `
      SELECT COUNT(*) as vote_count 
      FROM votes 
      WHERE task_id = $1
    `;
    
    const voteCountResult = await pool.query(voteCountQuery, [taskId]);
    const actualVoteCount = parseInt(voteCountResult.rows[0].vote_count || 0);
    console.log(`Direct vote count for task ${taskId}: ${actualVoteCount} votes found`);
    
    // Now get the participants and their voting status
    const participantsQuery = `
      WITH room_users AS (
        -- Direct room participants
        SELECT DISTINCT u.id, u.name, u.email
        FROM users u
        JOIN room_participants rp ON u.id = rp.user_id
        WHERE rp.room_id = $1
        
        UNION
        
        -- Group members that belong to this room
        SELECT DISTINCT u.id, u.name, u.email
        FROM users u
        JOIN group_members gm ON u.id = gm.user_id
        JOIN room_groups rg ON gm.group_id = rg.group_id
        WHERE rg.room_id = $1
      ),
      -- Get active votes for this task
      active_votes AS (
        SELECT user_id 
        FROM votes 
        WHERE task_id = $2
      )
      SELECT 
        ru.id,
        ru.name,
        ru.email,
        CASE WHEN av.user_id IS NOT NULL THEN true ELSE false END as has_voted
      FROM room_users ru
      LEFT JOIN active_votes av ON ru.id = av.user_id
      ORDER BY ru.name ASC
    `;

    const participantsResult = await pool.query(participantsQuery, [roomId, taskId]);
    const participantsWithStatus = participantsResult.rows;
    
    // Count votes in multiple ways to ensure accuracy
    const votesCount = participantsWithStatus.filter(p => p.has_voted).length;
    const totalParticipants = participantsWithStatus.length;
    
    // Use the most accurate count (direct DB count is most reliable)
    const finalVoteCount = actualVoteCount;
    
    console.log(`Voting status for task ${taskId}: ${finalVoteCount}/${totalParticipants} participants voted`);
    console.log(`Query-based vote count: ${votesCount}, Direct DB count: ${actualVoteCount}`);
    
    // Double check if the counts don't match and log a warning
    if (votesCount !== actualVoteCount) {
      console.warn(`Vote count mismatch for task ${taskId}: query shows ${votesCount} but direct count shows ${actualVoteCount}`);
    }

    // Generate a timestamp to help clients verify freshness of data
    const timestamp = new Date().toISOString();

    res.json({
      task_id: taskId,
      total_participants: participantsWithStatus.length,
      votes_cast: finalVoteCount, // Use the direct count from the database
      participants: participantsWithStatus,
      timestamp: timestamp,
      fresh: noCache ? true : undefined, // Indicates this is a fresh request
      debug: {
        query_count: votesCount,
        direct_count: actualVoteCount
      }
    });
  } catch (error) {
    console.error('Get participants voting status error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all votes for a task (for consolidated view)
router.get('/task/:taskId/all', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task
    const taskResult = await pool.query(
      'SELECT room_id FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check room access
    const access = await hasRoomAccess(pool, req.user.id, taskResult.rows[0].room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get all votes with voter names
    const result = await pool.query(
      `SELECT v.*, u.name as voter_name, u.email as voter_email
       FROM votes v
       JOIN users u ON v.user_id = u.id
       WHERE v.task_id = $1
       ORDER BY v.voted_at DESC`,
      [taskId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get all votes error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Clear all votes for a task (admin only) - MUST come before '/task/:taskId'
router.delete('/task/:taskId/clear', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`[CLEAR VOTES] Request received for task ${taskId} by user ${req.user.id}`);

    // Get task to check room
    const taskResult = await pool.query('SELECT room_id FROM tasks WHERE id = $1', [taskId]);
    if (taskResult.rows.length === 0) {
      console.log(`[CLEAR VOTES] Task ${taskId} not found`);
      return res.status(404).json({ error: 'Task not found' });
    }

    const roomId = taskResult.rows[0].room_id;
    console.log(`[CLEAR VOTES] Task ${taskId} belongs to room ${roomId}`);

    // Check if user is admin or creator
    const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, roomId);
    console.log(`[CLEAR VOTES] User ${req.user.id} is admin/creator: ${adminOrCreator}`);
    
    if (!adminOrCreator) {
      return res.status(403).json({ error: 'Only admins or creator can clear votes' });
    }

    // Delete all votes for this task
    const result = await pool.query(
      'DELETE FROM votes WHERE task_id = $1 RETURNING *',
      [taskId]
    );

    console.log(`[CLEAR VOTES] Deleted ${result.rowCount} votes for task ${taskId}`);

    // Emit socket event to notify all room participants
    const io = req.app.get('io');
    if (io) {
      io.to(`room-${roomId}`).emit('votes-cleared', {
        taskId: parseInt(taskId),
        deletedCount: result.rowCount
      });
      console.log(`[CLEAR VOTES] Emitted votes-cleared event to room ${roomId}`);
    }

    res.json({ 
      message: 'All votes cleared successfully',
      deletedCount: result.rowCount
    });
  } catch (error) {
    console.error('[CLEAR VOTES] Error:', error.message);
    // Don't log the full stack trace which could contain sensitive information
    console.error('[CLEAR VOTES] Error type:', error.name);
    res.status(500).json({ error: 'Server error processing your request' });
  }
});

// Delete vote (user's own vote)
router.delete('/task/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Get task
    const taskResult = await pool.query(
      'SELECT room_id, is_active FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    if (!task.is_active) {
      return res.status(400).json({ error: 'Cannot delete vote on inactive task' });
    }

    // Check room access
    const access = await hasRoomAccess(pool, req.user.id, task.room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query(
      'DELETE FROM votes WHERE task_id = $1 AND user_id = $2',
      [taskId, req.user.id]
    );

    res.json({ message: 'Vote deleted successfully' });
  } catch (error) {
    console.error('Delete vote error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
