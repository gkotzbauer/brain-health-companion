const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get conversation state
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId.replace('user', '');
    const result = await pool.query(
      'SELECT state_data FROM conversation_states WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows[0]?.state_data || null);
  } catch (err) {
    console.error('Error fetching state:', err);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

// Save conversation state
router.post('/', async (req, res) => {
  try {
    const { user_id, state_data } = req.body;
    const userId = user_id.replace('user', '');
    const result = await pool.query(
      `INSERT INTO conversation_states (user_id, state_data) 
       VALUES ($1, $2) 
       ON CONFLICT (user_id) 
       DO UPDATE SET state_data = $2, updated_at = NOW()
       RETURNING *`,
      [userId, state_data]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving state:', err);
    res.status(500).json({ error: 'Failed to save state' });
  }
});

module.exports = router;