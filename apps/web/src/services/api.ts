import axios, { AxiosError } from 'axios';
import { Product, Client, Order } from '../types';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, {}, {
          withCredentials: true,
        });
        const { accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        if (error.config) {
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout');
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data.data;
}

// Products
export async function getProducts(params?: any) {
  const { data } = await api.get('/products', { params });
  return data.data;
}

export async function getProduct(id: string) {
  const { data } = await api.get(`/products/${id}`);
  return data.data;
}

// Clients
export async function getClients(params?: any) {
  const { data } = await api.get('/clients', { params });
  return data.data;
}

export async function getClient(id: string) {
  const { data } = await api.get(`/clients/${id}`);
  return data.data;
}

export async function createClient(client: Partial<Client>) {
  const { data } = await api.post('/clients', client);
  return data.data;
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { data } = await api.put(`/clients/${id}`, client);
  return data.data;
}

export async function deleteClient(id: string) {
  const { data } = await api.delete(`/clients/${id}`);
  return data.data;
}

// Orders
export async function getOrders(params?: any) {
  const { data } = await api.get('/orders', { params });
  return data.data;
}

export async function getOrder(id: string) {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
}

export async function createOrder(order: Partial<Order>) {
  const { data } = await api.post('/orders', order);
  return data.data;
}

export async function updateOrder(id: string, order: Partial<Order>) {
  const { data } = await api.put(`/orders/${id}`, order);
  return data.data;
}

export async function updateOrderStatus(id: string, status: string, notes?: string) {
  const { data } = await api.put(`/orders/${id}/status`, { status, notes });
  return data.data;
}

// Sync
export async function syncBatch(items: any[]) {
  const { data } = await api.post('/sync/batch', { items });
  return data.data;
}

export async function getSyncStatus(userId: string) {
  const { data } = await api.get(`/sync/status/${userId}`);
  return data.data;
}

// Dashboard
export async function getDashboardSummary() {
  const { data } = await api.get('/dashboard/summary');
  return data.data;
}

export async function getRepPerformance() {
  const { data } = await api.get('/dashboard/rep-performance');
  return data.data;
}

export async function getInventoryAlerts() {
  const { data } = await api.get('/dashboard/inventory-alerts');
  return data.data;
}
