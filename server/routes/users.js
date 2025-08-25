const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users ORDER BY id'
    );
    res.json(result.rows.map(user => ({
      id: `user${user.id}`,
      name: user.username
    })));
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id.replace('user', '');
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      ...result.rows[0].diagnostic_profile,
      userId: `user${result.rows[0].id}`,
      name: result.rows[0].username
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { username, diagnostic_profile } = req.body;
    const result = await pool.query(
      'INSERT INTO users (username, diagnostic_profile) VALUES ($1, $2) RETURNING *',
      [username, diagnostic_profile]
    );
    res.json({
      id: `user${result.rows[0].id}`,
      name: result.rows[0].username
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user profile
router.put('/:id', async (req, res) => {
  try {
    const userId = req.params.id.replace('user', '');
    const { diagnostic_profile } = req.body;
    const result = await pool.query(
      'UPDATE users SET diagnostic_profile = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [diagnostic_profile, userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;