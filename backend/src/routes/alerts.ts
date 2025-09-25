import express from 'express';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

const router = express.Router();

// Get alerts
router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status, page = 1, limit = 20 } = req.query;
    
    let whereClause = 'WHERE user_id = $1';
    const params: any[] = [userId];
    
    if (status) {
      whereClause += ' AND status = $2';
      params.push(status);
    }
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const alerts = await query(`
      SELECT 
        id,
        title,
        description,
        type,
        severity,
        status,
        conditions,
        triggered_at,
        resolved_at,
        created_at
      FROM alerts 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    const totalResult = await query(`
      SELECT COUNT(*) as total FROM alerts ${whereClause}
    `, params);

    res.json({
      alerts: alerts.rows,
      total: parseInt(totalResult.rows[0].total),
      page: Number(page),
      totalPages: Math.ceil(parseInt(totalResult.rows[0].total) / Number(limit))
    });
  } catch (error) {
    logger.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Create alert rule
router.post('/rules', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, conditions, actions, isActive = true } = req.body;

    const result = await query(`
      INSERT INTO alert_rules (name, description, conditions, actions, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [name, description, JSON.stringify(conditions), JSON.stringify(actions), isActive, userId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Create alert rule error:', error);
    res.status(500).json({ error: 'Failed to create alert rule' });
  }
});

// Get alert rules
router.get('/rules', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const rules = await query(`
      SELECT 
        id,
        name,
        description,
        conditions,
        actions,
        is_active,
        created_at,
        updated_at
      FROM alert_rules 
      WHERE created_by = $1
      ORDER BY created_at DESC
    `, [userId]);

    res.json(rules.rows);
  } catch (error) {
    logger.error('Get alert rules error:', error);
    res.status(500).json({ error: 'Failed to fetch alert rules' });
  }
});

// Update alert status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = (req as any).user.id;

    const result = await query(`
      UPDATE alerts 
      SET status = $1, resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE NULL END
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `, [status, id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Update alert status error:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

export default router;