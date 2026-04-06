import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useAuthStore } from './store/useAuthStore'

// Comprehensive fetch interceptor for Sentinel Protocol
const originalFetch = window.fetch;
window.fetch = async function(...args: any[]) {
  const [resource, config = {}] = args;
  let finalResource = resource;
  
  // Normalize local API URL if needed
  if (typeof resource === 'string' && resource.startsWith('http://localhost:3001')) {
    finalResource = resource.replace('http://localhost:3001', '');
  }
  
  // Inject JWT if available
  const { token } = useAuthStore.getState();
  const headers = {
    ...config.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    'Content-Type': config.headers?.['Content-Type'] || 'application/json'
  };

  const response = await originalFetch(finalResource, {
    ...config,
    headers
  });

  // Handle systemic auth failures
  if (response.status === 401 && !finalResource.includes('/api/auth/login')) {
    useAuthStore.getState().logout();
    window.location.href = '/login';
  }

  return response;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
