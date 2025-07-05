import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { App } from './App';

/**
 * AppRouter component - Handles routing configuration
 * Separated from App component for Fast Refresh compliance
 */
export const AppRouter = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/session/:sessionId" element={<App />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};