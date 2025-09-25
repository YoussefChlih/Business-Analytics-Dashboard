import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
};

export { api };