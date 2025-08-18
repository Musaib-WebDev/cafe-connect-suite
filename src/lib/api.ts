import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string; role: string; phone?: string }) =>
    api.post('/auth/register', userData),
  
  getMe: () => api.get('/auth/me'),
  
  updateProfile: (data: any) => api.put('/auth/updatedetails', data),
  
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/updatepassword', data),
};

// Cafe API
export const cafeAPI = {
  getCafes: (params?: any) => api.get('/cafes', { params }),
  
  getCafe: (id: string) => api.get(`/cafes/${id}`),
  
  createCafe: (data: any) => api.post('/cafes', data),
  
  updateCafe: (id: string, data: any) => api.put(`/cafes/${id}`, data),
  
  deleteCafe: (id: string) => api.delete(`/cafes/${id}`),
  
  getMyCafe: () => api.get('/cafes/owner/me'),
  
  addTable: (cafeId: string, data: any) => api.post(`/cafes/${cafeId}/tables`, data),
  
  updateTable: (cafeId: string, tableId: string, data: any) =>
    api.put(`/cafes/${cafeId}/tables/${tableId}`, data),
  
  deleteTable: (cafeId: string, tableId: string) =>
    api.delete(`/cafes/${cafeId}/tables/${tableId}`),
};

// Menu API
export const menuAPI = {
  getMenuItems: (cafeId: string, params?: any) =>
    api.get(`/cafes/${cafeId}/menu`, { params }),
  
  getMenuItem: (id: string) => api.get(`/menu/${id}`),
  
  createMenuItem: (data: any) => api.post('/menu', data),
  
  updateMenuItem: (id: string, data: any) => api.put(`/menu/${id}`, data),
  
  deleteMenuItem: (id: string) => api.delete(`/menu/${id}`),
  
  updateAvailability: (id: string, isAvailable: boolean) =>
    api.put(`/menu/${id}/availability`, { isAvailable }),
  
  bulkUpdate: (items: any[]) => api.put('/menu/bulk', { items }),
  
  getCategories: (cafeId: string) => api.get(`/cafes/${cafeId}/menu/categories`),
  
  getPopular: (cafeId: string) => api.get(`/cafes/${cafeId}/menu/popular`),
};

// Order API
export const orderAPI = {
  getOrders: (cafeId: string, params?: any) =>
    api.get(`/cafes/${cafeId}/orders`, { params }),
  
  getOrder: (id: string) => api.get(`/orders/${id}`),
  
  createOrder: (data: any) => api.post('/orders', data),
  
  updateStatus: (id: string, status: string, note?: string) =>
    api.put(`/orders/${id}/status`, { status, note }),
  
  getMyOrders: (params?: any) => api.get('/orders/my', { params }),
  
  cancelOrder: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),
  
  rateOrder: (id: string, score: number, comment?: string) =>
    api.put(`/orders/${id}/rating`, { score, comment }),
};

// Reservation API
export const reservationAPI = {
  getReservations: (cafeId: string, params?: any) =>
    api.get(`/cafes/${cafeId}/reservations`, { params }),
  
  getReservation: (id: string) => api.get(`/reservations/${id}`),
  
  createReservation: (data: any) => api.post('/reservations', data),
  
  updateStatus: (id: string, status: string, note?: string) =>
    api.put(`/reservations/${id}/status`, { status, note }),
  
  getMyReservations: (params?: any) => api.get('/reservations/my', { params }),
  
  cancelReservation: (id: string, reason?: string) =>
    api.put(`/reservations/${id}/cancel`, { reason }),
  
  checkAvailability: (cafeId: string, params: any) =>
    api.get(`/cafes/${cafeId}/reservations/availability`, { params }),
  
  getAnalytics: (cafeId: string, params?: any) =>
    api.get(`/cafes/${cafeId}/reservations/analytics`, { params }),
};

// Promotion API
export const promotionAPI = {
  getPromotions: (cafeId: string, params?: any) =>
    api.get(`/cafes/${cafeId}/promotions`, { params }),
  
  getPromotion: (id: string) => api.get(`/promotions/${id}`),
  
  createPromotion: (data: any) => api.post('/promotions', data),
  
  updatePromotion: (id: string, data: any) => api.put(`/promotions/${id}`, data),
  
  deletePromotion: (id: string) => api.delete(`/promotions/${id}`),
  
  validatePromotion: (data: { code: string; cafeId: string; orderTotal?: number; customerId?: string }) =>
    api.post('/promotions/validate', data),
  
  getStats: (id: string) => api.get(`/promotions/${id}/stats`),
  
  deactivate: (id: string) => api.put(`/promotions/${id}/deactivate`),
  
  getMyPromotions: () => api.get('/promotions/my'),
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params?: any) => api.get('/inventory', { params }),
  
  getInventoryItem: (id: string) => api.get(`/inventory/${id}`),
  
  createOrUpdate: (data: any) => api.post('/inventory', data),
  
  updateItem: (id: string, data: any) => api.put(`/inventory/${id}`, data),
  
  deleteItem: (id: string) => api.delete(`/inventory/${id}`),
  
  addMovement: (id: string, data: any) => api.post(`/inventory/${id}/movement`, data),
  
  getAlerts: (params?: any) => api.get('/inventory/alerts', { params }),
  
  resolveAlert: (id: string, alertId: string) =>
    api.put(`/inventory/${id}/alerts/${alertId}/resolve`),
  
  getAnalytics: (params?: any) => api.get('/inventory/analytics', { params }),
  
  bulkUpdate: (items: any[]) => api.put('/inventory/bulk', { items }),
};

export default api;