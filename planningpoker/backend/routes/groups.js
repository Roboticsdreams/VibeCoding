const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');

// Get all groups for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT g.*, u.name as creator_name,
             gm.role as my_role
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      JOIN group_members gm ON g.id = gm.group_id
      WHERE gm.user_id = $1
      ORDER BY g.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get groups error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get group by ID with members
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is a member
    const memberCheck = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get group details
    const groupResult = await pool.query(`
      SELECT g.*, u.name as creator_name
      FROM groups g
      JOIN users u ON g.creator_id = u.id
      WHERE g.id = $1
    `, [id]);

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get members
    const membersResult = await pool.query(`
      SELECT u.id, u.email, u.name, gm.role, gm.joined_at
      FROM group_members gm
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at
    `, [id]);

    const group = groupResult.rows[0];
    group.members = membersResult.rows;

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create group
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

      const result = await pool.query(
        `INSERT INTO groups (name, description, creator_id) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [name, description, req.user.id]
      );

      const group = result.rows[0];

      // Add creator as admin member
      await pool.query(
        'INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, $3)',
        [group.id, req.user.id, 'admin']
      );

      res.status(201).json({
        message: 'Group created successfully',
        group
      });
    } catch (error) {
      console.error('Create group error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update group
router.put('/:id', authenticateToken,
  [
    body('name').optional().trim().notEmpty(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if user is creator
      const groupCheck = await pool.query(
        'SELECT creator_id FROM groups WHERE id = $1',
        [id]
      );

      if (groupCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (groupCheck.rows[0].creator_id !== req.user.id) {
        return res.status(403).json({ error: 'Only creator can update group' });
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
        UPDATE groups 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      res.json({
        message: 'Group updated successfully',
        group: result.rows[0]
      });
    } catch (error) {
      console.error('Update group error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete group
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is creator
    const groupCheck = await pool.query(
      'SELECT creator_id FROM groups WHERE id = $1',
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (groupCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Only creator can delete group' });
    }

    await pool.query('DELETE FROM groups WHERE id = $1', [id]);

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to group
router.post('/:id/members', authenticateToken,
  [body('userId').isInt()],
  async (req, res) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      // Check if user is creator
      const groupCheck = await pool.query(
        'SELECT creator_id FROM groups WHERE id = $1',
        [id]
      );

      if (groupCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (groupCheck.rows[0].creator_id !== req.user.id) {
        return res.status(403).json({ error: 'Only creator can add members' });
      }

      // Check if user exists
      const userCheck = await pool.query(
        'SELECT id, name, email FROM users WHERE id = $1',
        [userId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Add member
      await pool.query(
        `INSERT INTO group_members (group_id, user_id, role) 
         VALUES ($1, $2, $3)
         ON CONFLICT (group_id, user_id) DO NOTHING`,
        [id, userId, 'participant']
      );

      const member = userCheck.rows[0];
      
      res.json({
        message: 'Member added successfully',
        user: member
      });
      
      // Emit socket event for real-time updates (if io is available)
      if (req.app.get('io')) {
        req.app.get('io').emit('group-member-added', { groupId: id, member });
      }
    } catch (error) {
      console.error('Add member error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Remove member from group
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const { id, userId } = req.params;

    // Check if user is creator
    const groupCheck = await pool.query(
      'SELECT creator_id FROM groups WHERE id = $1',
      [id]
    );

    if (groupCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (groupCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ error: 'Only creator can remove members' });
    }

    // Prevent removing creator
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Creator cannot be removed' });
    }

    await pool.query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Member removed successfully' });
    
    // Emit socket event for real-time updates (if io is available)
    if (req.app.get('io')) {
      req.app.get('io').emit('group-member-removed', { groupId: id, userId });
    }
  } catch (error) {
    console.error('Remove member error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member role
router.put('/:id/members/:userId/role', authenticateToken,
  [body('role').isIn(['participant', 'admin'])],
  async (req, res) => {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      // Check if user is creator
      const groupCheck = await pool.query(
        'SELECT creator_id FROM groups WHERE id = $1',
        [id]
      );

      if (groupCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }

      if (groupCheck.rows[0].creator_id !== req.user.id) {
        return res.status(403).json({ error: 'Only creator can update roles' });
      }

      await pool.query(
        'UPDATE group_members SET role = $1 WHERE group_id = $2 AND user_id = $3',
        [role, id, userId]
      );

      res.json({ message: 'Member role updated successfully' });
      
      // Emit socket event for real-time updates (if io is available)
      if (req.app.get('io')) {
        req.app.get('io').emit('group-member-role-updated', { groupId: id, userId, role });
      }
    } catch (error) {
      console.error('Update role error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
