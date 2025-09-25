import express from 'express';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

const router = express.Router();

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    // Check cache first
    const cacheKey = `dashboard_overview_${userId}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Fetch dashboard data
    const kpis = await query(`
      SELECT 
        COUNT(DISTINCT orders.id) as total_orders,
        SUM(orders.total_amount) as total_revenue,
        COUNT(DISTINCT customers.id) as total_customers,
        AVG(orders.total_amount) as avg_order_value
      FROM orders 
      LEFT JOIN customers ON orders.customer_id = customers.id
      WHERE orders.created_at >= NOW() - INTERVAL '30 days'
    `);

    const recentActivity = await query(`
      SELECT 
        activity_type,
        description,
        created_at,
        user_id
      FROM activity_logs 
      WHERE user_id = $1
      ORDER BY created_at DESC 
      LIMIT 10
    `, [userId]);

    const overview = {
      kpis: kpis.rows[0] || {},
      recentActivity: recentActivity.rows,
      timestamp: new Date().toISOString()
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, JSON.stringify(overview), 300);

    res.json(overview);
  } catch (error) {
    logger.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get dashboard widgets
router.get('/widgets', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const widgets = await query(`
      SELECT 
        id,
        title,
        type,
        config,
        position,
        size,
        created_at,
        updated_at
      FROM dashboard_widgets 
      WHERE user_id = $1 
      ORDER BY position
    `, [userId]);

    res.json(widgets.rows);
  } catch (error) {
    logger.error('Dashboard widgets error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard widgets' });
  }
});

// Create custom widget
router.post('/widgets', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { title, type, config, position, size } = req.body;

    const result = await query(`
      INSERT INTO dashboard_widgets (user_id, title, type, config, position, size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, title, type, JSON.stringify(config), position, JSON.stringify(size)]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Create widget error:', error);
    res.status(500).json({ error: 'Failed to create widget' });
  }
});

export default router;