import React from 'react';
import ReactDOM from 'react-dom/client';
import { createLogger } from '@kit/logger/browser';
import { LoggerProvider } from '@kit/logger/react';
import App from './App.jsx';
import './index.css';

// Create root logger instance
const logger = createLogger({ scope: 'frontend' });

// Log startup
logger.info('Starting Claude Code UI frontend');

// Error boundary for root-level errors
window.addEventListener('error', (event) => {
  logger.error('Uncaught error', { error: event.error });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', { error: event.reason });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoggerProvider logger={logger}>
      <App />
    </LoggerProvider>
  </React.StrictMode>,
);
