const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');
const { generateInviteCode, getAllRoomParticipants, hasRoomAccess, isRoomCreator, isRoomAdmin, isRoomAdminOrCreator } = require('../utils/helpers');

// Get all rooms for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT r.*, u.name as creator_name
      FROM rooms r
      JOIN users u ON r.creator_id = u.id
      WHERE r.id IN (
        -- Direct participation
        SELECT room_id FROM room_participants WHERE user_id = $1
        UNION
        -- Group-based participation
        SELECT rg.room_id 
        FROM room_groups rg
        JOIN group_members gm ON rg.group_id = gm.group_id
        WHERE gm.user_id = $1
      )
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get rooms error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get room by ID with details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check access
    const access = await hasRoomAccess(pool, req.user.id, id);
    if (!access) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get room details
    const roomResult = await pool.query(`
      SELECT r.*, u.name as creator_name
      FROM rooms r
      JOIN users u ON r.creator_id = u.id
      WHERE r.id = $1
    `, [id]);

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];

    // Get all participants (direct + through groups)
    room.participants = await getAllRoomParticipants(pool, id);

    // Get groups assigned to room
    const groupsResult = await pool.query(`
      SELECT g.id, g.name, g.description
      FROM groups g
      JOIN room_groups rg ON g.id = rg.group_id
      WHERE rg.room_id = $1
    `, [id]);
    room.groups = groupsResult.rows;

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create room
router.post('/', authenticateToken,
  [
    body('name').trim().notEmpty(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;
      const inviteCode = generateInviteCode();

      const result = await pool.query(
        `INSERT INTO rooms (name, description, invite_code, creator_id) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [name, description, inviteCode, req.user.id]
      );

      const room = result.rows[0];

      // Add creator as admin participant
      await pool.query(
        'INSERT INTO room_participants (room_id, user_id, role) VALUES ($1, $2, $3)',
        [room.id, req.user.id, 'admin']
      );

      res.status(201).json({
        message: 'Room created successfully',
        room
      });
    } catch (error) {
      console.error('Create room error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update room
router.put('/:id', authenticateToken,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user is admin or creator
      const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
      if (!adminOrCreator) {
        return res.status(403).json({ error: 'Only admins or creator can update room' });
      }

      const { name, description } = req.body;
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const query = `
        UPDATE rooms 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      // Emit socket event to notify room participants
      const io = req.app.get('io');
      if (io) {
        io.to(`room-${id}`).emit('room-updated', result.rows[0]);
      }

      res.json({
        message: 'Room updated successfully',
        room: result.rows[0]
      });
    } catch (error) {
      console.error('Update room error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete room
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is creator
    const creator = await isRoomCreator(pool, req.user.id, id);
    if (!creator) {
      return res.status(403).json({ error: 'Only creator can delete room' });
    }

    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to room
router.post('/:id/participants', authenticateToken,
  [body('userId').isInt()],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Check if user is admin or creator
      const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
      if (!adminOrCreator) {
        return res.status(403).json({ error: 'Only admins or creator can add participants' });
      }

      // Check if user exists
      const userCheck = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add participant
      await pool.query(
        `INSERT INTO room_participants (room_id, user_id, role) 
         VALUES ($1, $2, $3)
         ON CONFLICT (room_id, user_id) DO NOTHING`,
        [id, userId, 'participant']
      );

      const participant = userCheck.rows[0];
      
      res.json({
        message: 'Participant added successfully',
        user: participant
      });
      
      // Emit socket event (if io is available)
      if (req.app.get('io')) {
        req.app.get('io').to(`room-${id}`).emit('participant-added', { roomId: id, participant });
      }
    } catch (error) {
      console.error('Add participant error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update participant role
router.patch('/:id/participants/:userId/role', authenticateToken,
  [body('role').isIn(['participant', 'admin'])],
  async (req, res) => {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      // Check if user is admin or creator
      const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
      if (!adminOrCreator) {
        return res.status(403).json({ error: 'Only admins or creator can change participant roles' });
      }

      // Check if participant exists
      const participantCheck = await pool.query(
        'SELECT user_id FROM room_participants WHERE room_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (participantCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Participant not found in room' });
      }

      // Prevent changing creator's role
      const creator = await isRoomCreator(pool, parseInt(userId), id);
      if (creator) {
        return res.status(400).json({ error: 'Cannot change creator role' });
      }

      // Update role
      await pool.query(
        'UPDATE room_participants SET role = $1 WHERE room_id = $2 AND user_id = $3',
        [role, id, userId]
      );

      res.json({ 
        message: `Participant role updated to ${role} successfully`,
        userId: parseInt(userId),
        role 
      });
      
      // Emit socket event (if io is available)
      if (req.app.get('io')) {
        req.app.get('io').to(`room-${id}`).emit('participant-role-changed', { 
          roomId: id, 
          userId: parseInt(userId), 
          role 
        });
      }
    } catch (error) {
      console.error('Update participant role error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Remove participant from room
router.delete('/:id/participants/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is admin or creator
    const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
    if (!adminOrCreator) {
      return res.status(403).json({ error: 'Only admins or creator can remove participants' });
    }

    // Prevent removing creator
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Creator cannot be removed' });
    }

    await pool.query(
      'DELETE FROM room_participants WHERE room_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Participant removed successfully' });
    
    // Emit socket event (if io is available)
    if (req.app.get('io')) {
      req.app.get('io').to(`room-${id}`).emit('participant-removed', { roomId: id, userId });
    }
  } catch (error) {
    console.error('Remove participant error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add group to room
router.post('/:id/groups', authenticateToken,
  [body('groupId').isInt()],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { groupId } = req.body;

      // Check if user is admin or creator
      const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
      if (!adminOrCreator) {
        return res.status(403).json({ error: 'Only admins or creator can add groups' });
      }

      // Check if group exists
      const groupCheck = await pool.query(
        'SELECT id, name FROM groups WHERE id = $1',
        [groupId]
      );

      if (groupCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      // Add group
      await pool.query(
        `INSERT INTO room_groups (room_id, group_id) 
         VALUES ($1, $2)
         ON CONFLICT (room_id, group_id) DO NOTHING`,
        [id, groupId]
      );

      const group = groupCheck.rows[0];
      
      res.json({
        message: 'Group added successfully',
        group
      });
      
      // Emit socket event (if io is available)
      if (req.app.get('io')) {
        req.app.get('io').to(`room-${id}`).emit('group-added', { roomId: id, group });
      }
    } catch (error) {
      console.error('Add group error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Remove group from room
router.delete('/:id/groups/:groupId', authenticateToken, async (req, res) => {
  try {
    const { id, groupId } = req.params;

    // Check if user is admin or creator
    const adminOrCreator = await isRoomAdminOrCreator(pool, req.user.id, id);
    if (!adminOrCreator) {
      return res.status(403).json({ error: 'Only admins or creator can remove groups' });
    }

    await pool.query(
      'DELETE FROM room_groups WHERE room_id = $1 AND group_id = $2',
      [id, groupId]
    );

    res.json({ message: 'Group removed successfully' });
    
    // Emit socket event (if io is available)
    if (req.app.get('io')) {
      req.app.get('io').to(`room-${id}`).emit('group-removed', { roomId: id, groupId });
    }
  } catch (error) {
    console.error('Remove group error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Join room by invite code
router.post('/join', authenticateToken,
  [body('inviteCode').trim().notEmpty()],
  async (req, res) => {
    try {
      const { inviteCode } = req.body;

      // Find room by invite code
      const roomResult = await pool.query(
        'SELECT id, name, description FROM rooms WHERE invite_code = $1',
        [inviteCode]
      );

      if (roomResult.rows.length === 0) {
        return res.status(404).json({ error: 'Invalid invite code' });
      }

      const room = roomResult.rows[0];

      // Add user as participant
      await pool.query(
        `INSERT INTO room_participants (room_id, user_id, role) 
         VALUES ($1, $2, $3)
         ON CONFLICT (room_id, user_id) DO NOTHING`,
        [room.id, req.user.id, 'participant']
      );

      res.json({
        message: 'Joined room successfully',
        room
      });
    } catch (error) {
      console.error('Join room error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
