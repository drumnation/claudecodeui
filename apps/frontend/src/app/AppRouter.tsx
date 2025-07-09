import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {ThemeProvider} from '@/contexts/ThemeContext';

// Lazy load the main App component
const App = lazy(() =>
  import('./App').then((module) => ({default: module.App})),
);

// Loading fallback component
const AppLoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">
        Loading Claude Code UI...
      </p>
    </div>
  </div>
);

/**
 * AppRouter component - Handles routing configuration with lazy loading
 * Separated from App component for Fast Refresh compliance
 */
export const AppRouter = () => {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={<AppLoadingFallback />}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/session/:sessionId" element={<App />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};
