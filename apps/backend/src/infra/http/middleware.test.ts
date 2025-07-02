import {describe, it, expect, vi, beforeEach} from 'vitest';
import express from 'express';
import cors from 'cors';
import {applyMiddleware} from './middleware.js';

vi.mock('express', () => ({
  default: {
    json: vi.fn(() => 'json-middleware'),
    urlencoded: vi.fn(() => 'urlencoded-middleware'),
  },
}));

vi.mock('cors', () => ({
  default: vi.fn(() => 'cors-middleware'),
}));

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyMiddleware', () => {
    it('should apply all middleware to the app', () => {
      const mockApp = {
        use: vi.fn(),
      };

      const corsOptions = {origin: true};
      applyMiddleware(mockApp as any, corsOptions);

      // Check CORS middleware
      expect(cors).toHaveBeenCalledWith(corsOptions);
      expect(mockApp.use).toHaveBeenCalledWith('cors-middleware');

      // Check JSON middleware
      expect(express.json).toHaveBeenCalledWith({limit: '50mb'});
      expect(mockApp.use).toHaveBeenCalledWith('json-middleware');

      // Check URL encoded middleware
      expect(express.urlencoded).toHaveBeenCalledWith({
        extended: true,
        limit: '50mb',
      });
      expect(mockApp.use).toHaveBeenCalledWith('urlencoded-middleware');

      // Verify all middleware were applied
      expect(mockApp.use).toHaveBeenCalledTimes(3);
    });
  });
});
