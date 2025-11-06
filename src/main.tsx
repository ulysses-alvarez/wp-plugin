import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Mount React app on WordPress shortcode div
const rootElement = document.getElementById('property-dashboard-root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} else {
  console.error('Property Dashboard: Root element not found. Make sure to use the [property_dashboard] shortcode.');
}
