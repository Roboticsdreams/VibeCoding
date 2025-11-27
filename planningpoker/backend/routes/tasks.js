const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');
const { hasRoomAccess, isRoomAdmin, isRoomAdminOrCreator, getAllRoomParticipants } = require('../utils/helpers');

// Get all tasks for a room
router.get('/room/:roomId', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check access
    const access = await hasRoomAccess(pool, req.user.id, roomId);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await pool.query(`
      SELECT t.*, u.name as created_by_name,
             MAX(jil.jira_issue_key) AS jira_issue_key,
             MAX(jil.jira_project_key) AS jira_project_key,
             COUNT(v.id) as vote_count
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN votes v ON t.id = v.task_id
      LEFT JOIN jira_issue_links jil ON t.id = jil.task_id
      WHERE t.room_id = $1
      GROUP BY t.id, u.name
      ORDER BY t.created_at DESC
    `, [roomId]);

    // Get total participants count
    const participants = await getAllRoomParticipants(pool, roomId);
    const totalParticipants = participants.length;

    const tasks = result.rows.map(task => ({
      ...task,
      total_participants: totalParticipants
    }));

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get task by ID with votes
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task
    const taskResult = await pool.query(`
      SELECT t.*, u.name as created_by_name
      FROM tasks t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `, [id]);

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // Check access
    const access = await hasRoomAccess(pool, req.user.id, task.room_id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get votes
    const votesResult = await pool.query(`
      SELECT v.*, u.name as user_name, u.email
      FROM votes v
      JOIN users u ON v.user_id = u.id
      WHERE v.task_id = $1
      ORDER BY v.voted_at
    `, [id]);

    task.votes = votesResult.rows;

    // Calculate statistics
    if (task.votes.length > 0) {
      const estimates = task.votes.map(v => v.estimate);
      task.statistics = {
        average: (estimates.reduce((a, b) => a + b, 0) / estimates.length).toFixed(1),
        min: Math.min(...estimates),
        max: Math.max(...estimates),
        mode: estimates.sort((a, b) =>
          estimates.filter(v => v === a).length - estimates.filter(v => v === b).length
        ).pop()
      };
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task
router.post('/', authenticateToken,
  [
    body('roomId').isInt(),
    body('title').trim().notEmpty(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { roomId, title, description } = req.body;

      // Check if user is admin
      const admin = await isRoomAdmin(pool, req.user.id, roomId);
      if (!admin) {
        return res.status(403).json({ error: 'Only admins can create tasks' });
      }

      const result = await pool.query(
        `INSERT INTO tasks (room_id, title, description, created_by, status) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [roomId, title, description, req.user.id, 'draft']
      );

      res.status(201).json({
        message: 'Task created successfully',
        task: result.rows[0]
      });
    } catch (error) {
      console.error('Create task error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update task
router.put('/:id', authenticateToken,
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('storyPoints').optional().isInt({ min: 0 })
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get task to check room
      const taskCheck = await pool.query('SELECT room_id FROM tasks WHERE id = $1', [id]);
      if (taskCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if user is admin
      const admin = await isRoomAdmin(pool, req.user.id, taskCheck.rows[0].room_id);
      if (!admin) {
        return res.status(403).json({ error: 'Only admins can update tasks' });
      }

      const { title, description, storyPoints } = req.body;
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }

      if (storyPoints !== undefined) {
        updates.push(`story_points = $${paramCount++}`);
        values.push(storyPoints);
        updates.push(`status = 'completed'`);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE tasks 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      res.json({
        message: 'Task updated successfully',
        task: result.rows[0]
      });
    } catch (error) {
      console.error('Update task error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task to check room
    const taskCheck = await pool.query('SELECT room_id FROM tasks WHERE id = $1', [id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is admin
    const admin = await isRoomAdmin(pool, req.user.id, taskCheck.rows[0].room_id);
    if (!admin) {
      return res.status(403).json({ error: 'Only admins can delete tasks' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Activate task for voting
router.post('/:id/activate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task to check room
    const taskCheck = await pool.query('SELECT room_id FROM tasks WHERE id = $1', [id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const roomId = taskCheck.rows[0].room_id;

    // Check if user is admin or creator
    const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, roomId);
    if (!adminOrCreator) {
      return res.status(403).json({ error: 'Only admins or creator can activate tasks' });
    }

    // Deactivate all other tasks in the room
    await pool.query(
      'UPDATE tasks SET is_active = FALSE WHERE room_id = $1',
      [roomId]
    );

    // Activate this task
    const result = await pool.query(
      `UPDATE tasks 
       SET is_active = TRUE, status = 'active', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // Emit socket event to notify room participants
    // NOTE: This is just an API response - the actual socket event
    // should be handled by the frontend emitting the event
    // Instead of directly emitting here, we rely on the client to emit the event
    // which is properly handled in server.js with the right permissions
    // This approach prevents race conditions between API response and socket events

    res.json({
      message: 'Task activated for voting',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Activate task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Deactivate task
router.post('/:id/deactivate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get task to check room
    const taskCheck = await pool.query('SELECT room_id FROM tasks WHERE id = $1', [id]);
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const roomId = taskCheck.rows[0].room_id;

    // Check if user is admin or creator
    const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, roomId);
    if (!adminOrCreator) {
      return res.status(403).json({ error: 'Only admins or creator can deactivate tasks' });
    }

    // Deactivate task
    const result = await pool.query(
      `UPDATE tasks 
       SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    // Emit socket event to notify room participants
    const io = req.app.get('io');
    if (io) {
      io.to(`room-${roomId}`).emit('task-deactivated', result.rows[0]);
    }

    res.json({
      message: 'Task deactivated',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Deactivate task error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get consolidated story points for a room
router.get('/room/:roomId/consolidate', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if user is admin
    const admin = await isRoomAdmin(pool, req.user.id, roomId);
    if (!admin) {
      return res.status(403).json({ error: 'Only admins can view consolidated data' });
    }

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN story_points IS NOT NULL THEN 1 END) as completed_tasks,
        COALESCE(SUM(story_points), 0) as total_story_points,
        COALESCE(AVG(story_points), 0) as average_story_points
      FROM tasks
      WHERE room_id = $1
    `, [roomId]);

    const tasksResult = await pool.query(`
      SELECT id, title, story_points, status
      FROM tasks
      WHERE room_id = $1 AND story_points IS NOT NULL
      ORDER BY created_at
    `, [roomId]);

    res.json({
      summary: result.rows[0],
      tasks: tasksResult.rows
    });
  } catch (error) {
    console.error('Get consolidated data error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
