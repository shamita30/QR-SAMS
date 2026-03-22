import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global fetch interceptor to route 'http://localhost:3001' to relative paths '/api/...'
// This enables the app to run on a public domain without referencing local ports.
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  let [resource, config] = args;
  if (typeof resource === 'string' && resource.startsWith('http://localhost:3001')) {
    resource = resource.replace('http://localhost:3001', '');
  }
  return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
