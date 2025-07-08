import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRouter } from './AppRouter'
import '../index.css'

// Mobile debugging utility
function createMobileDebugger() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const enableDebug = new URLSearchParams(window.location.search).has('debug') || 
                     localStorage.getItem('mobile-debug') === 'true';
  
  const debug = {
    log: (message, data = {}) => {
      if (enableDebug || isMobile) {
        console.log(`[Mobile Debug] ${message}`, data);
      }
    },
    info: () => ({
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      features: {
        localStorage: typeof Storage !== 'undefined',
        webSocket: typeof WebSocket !== 'undefined',
        serviceWorker: 'serviceWorker' in navigator,
        touchSupport: 'ontouchstart' in window
      },
      platform: {
        isMobile,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent)
      },
      environment: {
        url: window.location.href,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port,
        isNgrok: window.location.hostname.includes('ngrok'),
        isLocalhost: window.location.hostname === 'localhost'
      }
    })
  };
  
  return debug;
}

const mobileDebug = createMobileDebugger();

// Add error boundary for mobile debugging
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Log mobile debug information before app starts
mobileDebug.log('App starting', mobileDebug.info());

// Check for potential issues
const debugInfo = mobileDebug.info();
if (debugInfo.platform.isMobile) {
  mobileDebug.log('Mobile device detected');
  
  // Check for common mobile issues
  if (!debugInfo.features.webSocket) {
    mobileDebug.log('WARNING: WebSocket not available - HMR may not work');
  }
  
  if (window.innerWidth < 400) {
    mobileDebug.log('WARNING: Very narrow viewport detected', { width: window.innerWidth });
  }
}

// Check for mixed content issues (HTTPS page with HTTP requests)
// Enable this for all mobile devices or when in ngrok environment
if ((debugInfo.environment.protocol === 'https:' && debugInfo.environment.isNgrok) || debugInfo.platform.isMobile) {
  mobileDebug.log('Mixed content protection enabled');
  
  // Wrap fetch to automatically fix HTTP→HTTPS issues and warn about mixed content
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    let url = args[0];
    
    if (typeof url === 'string') {
      // If we're on HTTPS but making HTTP request, try to fix it
      if (window.location.protocol === 'https:' && url.startsWith('http://')) {
        // Convert HTTP to HTTPS for same-origin requests
        if (url.startsWith(`http://${window.location.hostname}`)) {
          url = url.replace('http://', 'https://');
          args[0] = url;
          mobileDebug.log('Auto-fixed HTTP→HTTPS request', { original: arguments[0], fixed: url });
        } else {
          mobileDebug.log('WARNING: HTTP request from HTTPS page detected', { url });
          console.warn('Mixed content warning: HTTP request from HTTPS page:', url);
        }
      }
    }
    
    return originalFetch.apply(this, args);
  };
}

// Add global error handler for mobile debugging
window.addEventListener('error', (event) => {
  mobileDebug.log('Global error caught', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack
  });
});

window.addEventListener('unhandledrejection', (event) => {
  mobileDebug.log('Unhandled promise rejection', {
    reason: event.reason,
    promise: event.promise
  });
});

try {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </React.StrictMode>,
  )
  
  mobileDebug.log('React app rendered successfully');
} catch (error) {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    debugInfo: mobileDebug.info()
  };
  
  console.error('Failed to render React app:', error);
  mobileDebug.log('React render failed', errorInfo);
  
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; font-family: monospace; max-width: 100vw; overflow-x: auto;">
      <h1>Failed to start app</h1>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Browser:</strong> ${navigator.userAgent}</p>
      <p><strong>Viewport:</strong> ${window.innerWidth}x${window.innerHeight}</p>
      <p><strong>Device Pixel Ratio:</strong> ${window.devicePixelRatio}</p>
      <details style="margin-top: 10px;">
        <summary>Debug Information</summary>
        <pre style="font-size: 12px; white-space: pre-wrap; word-break: break-all;">
${JSON.stringify(errorInfo, null, 2)}
        </pre>
      </details>
      <p style="margin-top: 10px; font-size: 12px; color: #666;">
        Try adding ?debug=true to the URL for more debugging info
      </p>
    </div>
  `;
}