import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role',
      [email, hashedPassword, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
      expiresIn: '24h'
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;