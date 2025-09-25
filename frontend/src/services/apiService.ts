import { api } from './authService';

export interface DashboardOverview {
  kpis: {
    total_orders: number;
    total_revenue: number;
    total_customers: number;
    avg_order_value: number;
  };
  recentActivity: Array<{
    activity_type: string;
    description: string;
    created_at: string;
  }>;
  timestamp: string;
}

export interface Widget {
  id: string;
  title: string;
  type: string;
  config: any;
  position: number;
  size: any;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: string;
  severity: string;
  status: string;
  triggered_at: string;
  resolved_at?: string;
}

export interface ChartData {
  type: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  dateRange: string;
  metric?: string;
}

export const apiService = {
  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  async getWidgets(): Promise<Widget[]> {
    const response = await api.get('/dashboard/widgets');
    return response.data;
  },

  async createWidget(widget: Omit<Widget, 'id'>): Promise<Widget> {
    const response = await api.post('/dashboard/widgets', widget);
    return response.data;
  },

  // Analytics
  async getChartData(type: string, dateRange: string = '30d', metric?: string): Promise<ChartData> {
    const response = await api.get(`/analytics/charts/${type}`, {
      params: { dateRange, metric }
    });
    return response.data;
  },

  async getPredictions(metric: string, periods: number = 12): Promise<any> {
    const response = await api.get(`/analytics/predictions/${metric}`, {
      params: { periods }
    });
    return response.data;
  },

  async getAnomalies(metric: string, threshold: number = 2): Promise<any> {
    const response = await api.get(`/analytics/anomalies/${metric}`, {
      params: { threshold }
    });
    return response.data;
  },

  // Alerts
  async getAlerts(status?: string, page: number = 1, limit: number = 20): Promise<any> {
    const response = await api.get('/alerts', {
      params: { status, page, limit }
    });
    return response.data;
  },

  async updateAlertStatus(id: string, status: string): Promise<Alert> {
    const response = await api.patch(`/alerts/${id}/status`, { status });
    return response.data;
  },

  async getAlertRules(): Promise<any[]> {
    const response = await api.get('/alerts/rules');
    return response.data;
  },

  async createAlertRule(rule: any): Promise<any> {
    const response = await api.post('/alerts/rules', rule);
    return response.data;
  },

  // Data Management
  async getDataSources(): Promise<any[]> {
    const response = await api.get('/data/sources');
    return response.data;
  },

  async createDataSource(source: any): Promise<any> {
    const response = await api.post('/data/sources', source);
    return response.data;
  },

  async uploadCSV(file: File, tableName: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tableName', tableName);
    
    const response = await api.post('/data/upload/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async exportData(table: string, format: string = 'json'): Promise<any> {
    const response = await api.get(`/data/export/${table}`, {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    });
    return response.data;
  },

  // Users
  async getUserProfile(): Promise<any> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateUserProfile(profile: any): Promise<any> {
    const response = await api.put('/users/profile', profile);
    return response.data;
  },

  async getUsers(page: number = 1, limit: number = 20): Promise<any> {
    const response = await api.get('/users', {
      params: { page, limit }
    });
    return response.data;
  },

  async updateUserRole(id: string, role: string): Promise<any> {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },
};