import express from 'express';
import { query } from '../config/database';
import { cache } from '../config/redis';
import { logger } from '../utils/logger';

const router = express.Router();

// Get analytics data for charts
router.get('/charts/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { dateRange = '30d', metric } = req.query;
    
    const cacheKey = `analytics_${type}_${dateRange}_${metric}`;
    const cached = await cache.get(cacheKey);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    let data: any[] = [];
    
    switch (type) {
      case 'revenue':
        data = await getRevenueData(dateRange as string);
        break;
      case 'orders':
        data = await getOrdersData(dateRange as string);
        break;
      case 'customers':
        data = await getCustomersData(dateRange as string);
        break;
      case 'performance':
        data = await getPerformanceData(metric as string, dateRange as string);
        break;
      default:
        return res.status(400).json({ error: 'Invalid chart type' });
    }

    const result = {
      type,
      data,
      dateRange,
      metric,
      timestamp: new Date().toISOString()
    };

    // Cache for 10 minutes
    await cache.set(cacheKey, JSON.stringify(result), 600);
    
    res.json(result);
  } catch (error) {
    logger.error('Analytics charts error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Predictive analytics
router.get('/predictions/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { periods = 12 } = req.query;

    // Simple linear regression for prediction (in production, use more sophisticated models)
    const historicalData = await getHistoricalData(metric, 30);
    const predictions = generatePredictions(historicalData, Number(periods));

    res.json({
      metric,
      historical: historicalData,
      predictions,
      confidence: 0.75, // Mock confidence score
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Predictive analytics error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// Anomaly detection
router.get('/anomalies/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    const { threshold = 2 } = req.query;

    const data = await getHistoricalData(metric, 90);
    const anomalies = detectAnomalies(data, Number(threshold));

    res.json({
      metric,
      anomalies,
      threshold: Number(threshold),
      detectedCount: anomalies.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Anomaly detection error:', error);
    res.status(500).json({ error: 'Failed to detect anomalies' });
  }
});

// Helper functions
async function getRevenueData(dateRange: string) {
  const days = parseInt(dateRange.replace('d', ''));
  const result = await query(`
    SELECT 
      DATE(created_at) as date,
      SUM(total_amount) as value
    FROM orders 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `);
  return result.rows;
}

async function getOrdersData(dateRange: string) {
  const days = parseInt(dateRange.replace('d', ''));
  const result = await query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as value
    FROM orders 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `);
  return result.rows;
}

async function getCustomersData(dateRange: string) {
  const days = parseInt(dateRange.replace('d', ''));
  const result = await query(`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as value
    FROM customers 
    WHERE created_at >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(created_at)
    ORDER BY date
  `);
  return result.rows;
}

async function getPerformanceData(metric: string, dateRange: string) {
  const days = parseInt(dateRange.replace('d', ''));
  // Mock performance data - in production, this would come from monitoring systems
  const result = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 100 + 50 // Mock data
    });
  }
  return result;
}

async function getHistoricalData(metric: string, days: number) {
  // Mock historical data - in production, fetch from appropriate tables
  const data = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 1000 + 500
    });
  }
  return data;
}

function generatePredictions(historicalData: any[], periods: number) {
  // Simple linear regression for predictions
  const predictions = [];
  const lastValue = historicalData[historicalData.length - 1]?.value || 0;
  const trend = calculateTrend(historicalData);
  
  for (let i = 1; i <= periods; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    predictions.push({
      date: date.toISOString().split('T')[0],
      value: lastValue + (trend * i),
      confidence: Math.max(0.1, 0.9 - (i * 0.05)) // Decreasing confidence over time
    });
  }
  
  return predictions;
}

function calculateTrend(data: any[]) {
  if (data.length < 2) return 0;
  
  const recent = data.slice(-7); // Use last 7 days for trend
  let totalChange = 0;
  
  for (let i = 1; i < recent.length; i++) {
    totalChange += recent[i].value - recent[i - 1].value;
  }
  
  return totalChange / (recent.length - 1);
}

function detectAnomalies(data: any[], threshold: number) {
  if (data.length < 7) return [];
  
  const values = data.map(d => d.value);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  );
  
  const anomalies = [];
  
  for (let i = 0; i < data.length; i++) {
    const zScore = Math.abs((data[i].value - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push({
        ...data[i],
        zScore,
        severity: zScore > threshold * 1.5 ? 'high' : 'medium'
      });
    }
  }
  
  return anomalies;
}

export default router;