const express = require('express');
const router = express.Router();
const pool = require('../db');

// Save session
router.post('/', async (req, res) => {
  try {
    const { user_id, session_number, session_data } = req.body;
    const userId = user_id.replace('user', '');
    const result = await pool.query(
      'INSERT INTO sessions (user_id, session_number, session_data) VALUES ($1, $2, $3) RETURNING *',
      [userId, session_number, session_data]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving session:', err);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

// Get user sessions
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.replace('user', '');
    const result = await pool.query(
      'SELECT * FROM sessions WHERE user_id = $1 ORDER BY completed_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;