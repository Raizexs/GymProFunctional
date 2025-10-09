import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    if (error.response?.status >= 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post(`/auth/register/${userData.userType}`, userData),
  getProfile: () => api.get('/auth/me'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

// Clients API
export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  update: (id, data) => api.put(`/clients/${id}`, data),
  getReservations: (id, params) => api.get(`/clients/${id}/reservations`, { params }),
  getPayments: (id, params) => api.get(`/clients/${id}/payments`, { params }),
  getStats: (id) => api.get(`/clients/${id}/stats`),
  deactivate: (id) => api.put(`/clients/${id}/deactivate`),
};

// Trainers API
export const trainersAPI = {
  getAll: (params) => api.get('/trainers', { params }),
  getById: (id) => api.get(`/trainers/${id}`),
  update: (id, data) => api.put(`/trainers/${id}`, data),
  getClasses: (id, params) => api.get(`/trainers/${id}/classes`, { params }),
  getSchedule: (id, params) => api.get(`/trainers/${id}/schedule`, { params }),
  getStats: (id) => api.get(`/trainers/${id}/stats`),
  updateAvailability: (id, data) => api.put(`/trainers/${id}/availability`, data),
};

// Classes API
export const classesAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getSchedule: (id, params) => api.get(`/classes/${id}/schedule`, { params }),
};

// Reservations API
export const reservationsAPI = {
  getAll: (params) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  cancel: (id, data) => api.put(`/reservations/${id}/cancel`, data),
  checkIn: (id) => api.put(`/reservations/${id}/checkin`),
  submitFeedback: (id, data) => api.put(`/reservations/${id}/feedback`, data),
};

// Payments API
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  requestRefund: (id, data) => api.post(`/payments/${id}/refund`, data),
};

// Statistics API
export const statisticsAPI = {
  getOverview: () => api.get('/statistics/overview'),
  getRevenue: (params) => api.get('/statistics/revenue', { params }),
  getAttendance: (params) => api.get('/statistics/attendance', { params }),
  getClients: () => api.get('/statistics/clients'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  getReports: (params) => api.get('/admin/reports', { params }),
};

export default api;
