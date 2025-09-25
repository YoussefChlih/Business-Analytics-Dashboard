import express from 'express';
import { query } from '../config/database';
import { requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const result = await query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        last_login
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName } = req.body;

    const result = await query(`
      UPDATE users 
      SET first_name = $1, last_name = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, email, first_name, last_name, role
    `, [firstName, lastName, userId]);

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Update user profile error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const users = await query(`
      SELECT 
        id,
        email,
        first_name,
        last_name,
        role,
        created_at,
        last_login
      FROM users 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const totalResult = await query('SELECT COUNT(*) as total FROM users');

    res.json({
      users: users.rows,
      total: parseInt(totalResult.rows[0].total),
      page: Number(page),
      totalPages: Math.ceil(parseInt(totalResult.rows[0].total) / Number(limit))
    });
  } catch (error) {
    logger.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await query(`
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role
    `, [role, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

export default router;