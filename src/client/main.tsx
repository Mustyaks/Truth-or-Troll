import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

// Ensure the app is properly sized for Reddit's post environment
document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

// Set minimum height for the game
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.style.minHeight = '600px';
  rootElement.style.height = '100vh';
  rootElement.style.maxHeight = '800px';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
