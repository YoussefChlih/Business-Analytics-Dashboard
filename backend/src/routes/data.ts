import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import { query } from '../config/database';
import { logger } from '../utils/logger';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get data sources
router.get('/sources', async (req, res) => {
  try {
    const sources = await query(`
      SELECT 
        id,
        name,
        type,
        connection_config,
        status,
        last_sync,
        created_at
      FROM data_sources
      ORDER BY created_at DESC
    `);

    res.json(sources.rows);
  } catch (error) {
    logger.error('Data sources error:', error);
    res.status(500).json({ error: 'Failed to fetch data sources' });
  }
});

// Create data source
router.post('/sources', async (req, res) => {
  try {
    const { name, type, connectionConfig } = req.body;
    const userId = (req as any).user.id;

    const result = await query(`
      INSERT INTO data_sources (name, type, connection_config, created_by, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING *
    `, [name, type, JSON.stringify(connectionConfig), userId]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Create data source error:', error);
    res.status(500).json({ error: 'Failed to create data source' });
  }
});

// Upload CSV data
router.post('/upload/csv', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { tableName } = req.body;
    const userId = (req as any).user.id;
    const results: any[] = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          if (results.length === 0) {
            return res.status(400).json({ error: 'Empty CSV file' });
          }

          // Create table dynamically based on CSV headers
          const headers = Object.keys(results[0]);
          const columns = headers.map(header => `${header} TEXT`).join(', ');
          
          await query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
              id SERIAL PRIMARY KEY,
              ${columns},
              uploaded_by INTEGER REFERENCES users(id),
              uploaded_at TIMESTAMP DEFAULT NOW()
            )
          `);

          // Insert data
          for (const row of results) {
            const values = headers.map(header => row[header]);
            const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
            
            await query(`
              INSERT INTO ${tableName} (${headers.join(', ')}, uploaded_by)
              VALUES (${placeholders}, $${values.length + 1})
            `, [...values, userId]);
          }

          // Clean up uploaded file
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }

          res.json({
            message: 'CSV uploaded successfully',
            rowsInserted: results.length,
            tableName
          });
        } catch (dbError) {
          logger.error('CSV processing error:', dbError);
          res.status(500).json({ error: 'Failed to process CSV data' });
        }
      });
  } catch (error) {
    logger.error('CSV upload error:', error);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

// Export data
router.get('/export/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const { format = 'json' } = req.query;

    const result = await query(`SELECT * FROM ${table} LIMIT 1000`);

    if (format === 'csv') {
      const csvContent = convertToCSV(result.rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${table}.csv`);
      res.send(csvContent);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    logger.error('Data export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export default router;