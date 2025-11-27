const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../db/config');
const { authenticateToken } = require('../middleware/auth');
const { verifyJiraCredentials } = require('../utils/jira');

// Register
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
        [email, hashedPassword, name]
      );

      const user = result.rows[0];

      // Generate token - use only ID to avoid storing personal data in JWT
      // NOTE: Security measure - we only store non-personal data (user ID) in the token
      // to avoid exposing PII in case the token is compromised.
      const token = jwt.sign(
        { id: user.id }, // Only include non-personal ID in the token payload
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Register error:', error.message);
      res.status(500).json({ error: 'Server error during registration' });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const result = await pool.query(
        'SELECT id, email, name, password FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = result.rows[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token - use only ID to avoid storing personal data in JWT
      // NOTE: Security measure - we only store non-personal data (user ID) in the token
      // to avoid exposing PII in case the token is compromised.
      const token = jwt.sign(
        { id: user.id }, // Only include non-personal ID in the token payload
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error('Login error:', error.message);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// Test endpoint to verify routing
router.get('/test-search', authenticateToken, async (req, res) => {
  res.json({ message: 'Search endpoint is accessible', userId: req.user.id });
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, created_at, jira_integration_enabled, jira_email, jira_url FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send the actual token back to client, just indicate if it exists
    const user = result.rows[0];
    if (user.jira_integration_enabled) {
      user.has_jira_token = true;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', authenticateToken,
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }

      if (email) {
        updates.push(`email = $${paramCount++}`);
        values.push(email);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(req.user.id);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, email, name, updated_at, jira_integration_enabled, jira_email, jira_url
      `;

      const result = await pool.query(query, values);

      // Don't send the actual token back to client, just indicate if it exists
      const user = result.rows[0];
      if (user.jira_integration_enabled) {
        user.has_jira_token = true;
      }

      res.json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error('Update profile error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete account
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Search users by name or email
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    // Use a safer logging approach to prevent log injection
    console.log('Search request received');
    console.log('Current user ID:', req.user.id);
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = `%${q.trim()}%`;
    
    const result = await pool.query(
      `SELECT id, name, email 
       FROM users 
       WHERE (name ILIKE $1 OR email ILIKE $1) AND id != $2
       ORDER BY name 
       LIMIT 10`,
      [searchTerm, req.user.id]
    );

    console.log('Search results:', result.rows.length, 'users found');
    res.json(result.rows);
  } catch (error) {
    console.error('Search users error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Jira integration endpoints

// Update Jira settings
router.put('/jira-settings', authenticateToken,
  [
    body('jiraUrl').isURL().withMessage('Valid Jira URL required'),
    body('jiraEmail').notEmpty().withMessage('Username/email is required'),
    body('jiraToken').notEmpty().withMessage('Authentication token is required'),
    body('authType').isIn(['token', 'pat', 'basic']).withMessage('Invalid authentication type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { jiraUrl, jiraEmail, jiraToken, authType } = req.body;

      // Verify Jira credentials before saving
      try {
        await verifyJiraCredentials({ jiraUrl, jiraEmail, jiraToken, authType });
      } catch (error) {
        return res.status(401).json({ error: 'Invalid Jira credentials' });
      }

      // Update user profile with Jira details
      const result = await pool.query(
        `UPDATE users
         SET jira_url = $1, jira_email = $2, jira_token = $3, jira_auth_type = $4, jira_integration_enabled = TRUE
         WHERE id = $5
         RETURNING id, email, name, jira_url, jira_email, jira_auth_type, jira_integration_enabled`,
        [jiraUrl, jiraEmail, jiraToken, authType, req.user.id]
      );

      const user = result.rows[0];
      user.has_jira_token = true; // Don't send actual token back

      res.json({
        message: 'Jira integration enabled successfully',
        user
      });
    } catch (error) {
      console.error('Update Jira settings error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete Jira settings
router.delete('/jira-settings', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      `UPDATE users
       SET jira_token = NULL, jira_url = NULL, jira_email = NULL, jira_integration_enabled = FALSE
       WHERE id = $1`,
      [req.user.id]
    );

    res.json({
      message: 'Jira integration disabled successfully'
    });
  } catch (error) {
    console.error('Delete Jira settings error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Validate Jira credentials
router.post('/validate-jira', authenticateToken,
  [
    body('jiraUrl').isURL().withMessage('Valid Jira URL required'),
    body('jiraEmail').notEmpty().withMessage('Username/email is required'),
    body('jiraToken').notEmpty().withMessage('Authentication token is required'),
    body('authType').isIn(['token', 'pat', 'basic']).withMessage('Invalid authentication type')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { jiraUrl, jiraEmail, jiraToken, authType } = req.body;

      try {
        const user = await verifyJiraCredentials({ jiraUrl, jiraEmail, jiraToken, authType });
        res.json({ valid: true, user });
      } catch (error) {
        res.status(401).json({ valid: false, error: error.message });
      }
    } catch (error) {
      console.error('Validate Jira credentials error:', error.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
