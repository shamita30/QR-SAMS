import { useAuthStore } from '../store/useAuthStore';

const BASE_URL = '';

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const { token } = useAuthStore.getState();
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return response;
  }
};
