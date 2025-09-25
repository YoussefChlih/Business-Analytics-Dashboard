import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiService } from '../services/apiService';
import { useSocket } from '../contexts/SocketContext';
import { format, parseISO } from 'date-fns';

const Dashboard: React.FC = () => {
  const { joinDashboard } = useSocket();

  useEffect(() => {
    joinDashboard('main');
  }, [joinDashboard]);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: apiService.getDashboardOverview,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: revenueData } = useQuery({
    queryKey: ['chart-revenue'],
    queryFn: () => apiService.getChartData('revenue', '30d'),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['chart-orders'],
    queryFn: () => apiService.getChartData('orders', '30d'),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: overview?.kpis?.total_revenue || 0,
      icon: <AttachMoney sx={{ fontSize: 40, color: 'primary.main' }} />,
      formatter: formatCurrency,
      color: 'primary.main',
    },
    {
      title: 'Total Orders',
      value: overview?.kpis?.total_orders || 0,
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'success.main' }} />,
      formatter: formatNumber,
      color: 'success.main',
    },
    {
      title: 'Total Customers',
      value: overview?.kpis?.total_customers || 0,
      icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
      formatter: formatNumber,
      color: 'info.main',
    },
    {
      title: 'Avg Order Value',
      value: overview?.kpis?.avg_order_value || 0,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'warning.main' }} />,
      formatter: formatCurrency,
      color: 'warning.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Overview
      </Typography>

      {/* KPI Cards */}
      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        {kpiCards.map((kpi, index) => (
          <Box key={index} flex="1 1 300px" minWidth="250px">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {overviewLoading ? '...' : kpi.formatter(kpi.value)}
                    </Typography>
                  </Box>
                  {kpi.icon}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Charts */}
      <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 3 }}>
        <Box flex="1 1 500px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend (Last 30 Days)
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 500px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Orders Trend (Last 30 Days)
              </Typography>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'MM/dd')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value as string), 'MMM dd, yyyy')}
                      formatter={(value: number) => [formatNumber(value), 'Orders']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#4caf50"
                      name="Orders"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Box display="flex" flexWrap="wrap" gap={3}>
        <Box flex="1 1 400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {overview?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip 
                            label={activity.activity_type} 
                            size="small" 
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(parseISO(activity.created_at), 'MMM dd, HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText primary="No recent activity" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Box>

        <Box flex="1 1 400px">
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <Box>
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2">Revenue Growth</Typography>
                  <Typography variant="body2" color="success.main">
                    +12.5%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2">Order Conversion</Typography>
                  <Typography variant="body2" color="primary.main">
                    3.2%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2">Customer Retention</Typography>
                  <Typography variant="body2" color="info.main">
                    85.7%
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={1}>
                  <Typography variant="body2">Average Session</Typography>
                  <Typography variant="body2">
                    4m 23s
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;