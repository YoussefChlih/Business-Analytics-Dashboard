import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { apiService } from '../services/apiService';
import { format, parseISO } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState('30d');
  const [metric, setMetric] = useState('revenue');

  const { data: chartData } = useQuery({
    queryKey: ['analytics-chart', metric, dateRange],
    queryFn: () => apiService.getChartData(metric, dateRange),
  });

  const { data: predictions } = useQuery({
    queryKey: ['predictions', metric],
    queryFn: () => apiService.getPredictions(metric, 12),
    enabled: tabValue === 1,
  });

  const { data: anomalies } = useQuery({
    queryKey: ['anomalies', metric],
    queryFn: () => apiService.getAnomalies(metric, 2),
    enabled: tabValue === 2,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    return new Intl.NumberFormat('en-US').format(value);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Advanced Analytics
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Metric</InputLabel>
            <Select
              value={metric}
              label="Metric"
              onChange={(e) => setMetric(e.target.value)}
            >
              <MenuItem value="revenue">Revenue</MenuItem>
              <MenuItem value="orders">Orders</MenuItem>
              <MenuItem value="customers">Customers</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Historical Analysis" />
          <Tab label="Predictive Analytics" />
          <Tab label="Anomaly Detection" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box p={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {metric.charAt(0).toUpperCase() + metric.slice(1)} Trend
                </Typography>
                <Box height={400}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData?.data || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                      />
                      <YAxis tickFormatter={(value) => formatValue(value)} />
                      <Tooltip 
                        labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                        formatter={(value: number) => [formatValue(value), metric]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#1976d2" 
                        strokeWidth={2}
                        name={metric}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box p={3} display="flex" gap={3}>
            <Box flex={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Predictions for Next 12 Periods
                  </Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                        />
                        <YAxis tickFormatter={(value) => formatValue(value)} />
                        <Tooltip 
                          labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                          formatter={(value: number) => [formatValue(value), 'Predicted']}
                        />
                        <Legend />
                        <Line 
                          data={predictions?.historical || []}
                          type="monotone" 
                          dataKey="value" 
                          stroke="#1976d2" 
                          strokeWidth={2}
                          name="Historical"
                        />
                        <Line 
                          data={predictions?.predictions || []}
                          type="monotone" 
                          dataKey="value" 
                          stroke="#ff9800" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Predicted"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Prediction Insights
                  </Typography>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Model Confidence
                    </Typography>
                    <Typography variant="h4" color="primary.main" gutterBottom>
                      {predictions?.confidence ? `${(predictions.confidence * 100).toFixed(1)}%` : 'N/A'}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                      Forecast Trend
                    </Typography>
                    <Chip 
                      label="Upward Trend"
                      color="success"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Predictions are based on historical patterns and may vary due to external factors.
                    </Alert>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box p={3} display="flex" gap={3}>
            <Box flex={2}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Anomaly Detection Results
                  </Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                        />
                        <YAxis tickFormatter={(value) => formatValue(value)} />
                        <Tooltip 
                          labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                          formatter={(value: number) => [formatValue(value), 'Value']}
                        />
                        <Legend />
                        <Scatter 
                          data={anomalies?.anomalies || []}
                          fill="#f44336"
                          name="Anomalies"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            <Box flex={1}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detected Anomalies
                  </Typography>
                  <Typography variant="h3" color="error.main" gutterBottom>
                    {anomalies?.detectedCount || 0}
                  </Typography>
                  
                  <List>
                    {anomalies?.anomalies?.slice(0, 5).map((anomaly: any, index: number) => (
                      <ListItem key={index} divider>
                        <ListItemText
                          primary={format(parseISO(anomaly.date), 'MMM dd, yyyy')}
                          secondary={
                            <Box>
                              <Typography variant="body2">
                                Value: {formatValue(anomaly.value)}
                              </Typography>
                              <Chip 
                                label={anomaly.severity}
                                color={anomaly.severity === 'high' ? 'error' : 'warning'}
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    )) || (
                      <ListItem>
                        <ListItemText primary="No anomalies detected" />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;