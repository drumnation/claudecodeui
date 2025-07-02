import {describe, it, expect, vi, beforeEach} from 'vitest';
import express from 'express';
import http from 'node:http';

// Mocks must be defined before imports that use them
const mockNetworkInterfaces = vi.fn();

vi.mock('express');
vi.mock('node:http');
vi.mock('node:os', () => ({
  default: {
    networkInterfaces: () => mockNetworkInterfaces(),
  },
}));

import {
  createExpressApp,
  createHttpServer,
  startServer,
  getNetworkIP,
} from './server.js';

describe('HTTP Server Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExpressApp', () => {
    it('should create an express app', () => {
      const mockApp = {};
      (express as any).mockReturnValue(mockApp);

      const app = createExpressApp();

      expect(express).toHaveBeenCalled();
      expect(app).toBe(mockApp);
    });
  });

  describe('createHttpServer', () => {
    it('should create an http server with the express app', () => {
      const mockApp = {};
      const mockServer = {};
      (http.createServer as any).mockReturnValue(mockServer);

      const server = createHttpServer(mockApp as any);

      expect(http.createServer).toHaveBeenCalledWith(mockApp);
      expect(server).toBe(mockServer);
    });
  });

  describe('startServer', () => {
    it('should start the server and return server info', async () => {
      mockNetworkInterfaces.mockReturnValue({
        eth0: [{family: 'IPv4', internal: false, address: '192.168.1.100'}],
      });

      const mockServer = {
        listen: vi.fn().mockImplementation((port, host, callback) => {
          callback();
          return {on: vi.fn()};
        }),
      };

      const config = {
        port: 3000,
        host: '0.0.0.0',
        corsOptions: {} as any,
      };

      const result = await startServer(mockServer as any, config);

      expect(mockServer.listen).toHaveBeenCalledWith(
        3000,
        '0.0.0.0',
        expect.any(Function),
      );
      expect(result).toHaveProperty('port', 3000);
      expect(result).toHaveProperty('host', '0.0.0.0');
      expect(result).toHaveProperty('networkIP', '192.168.1.100');
    });

    it('should reject on server error', async () => {
      const mockError = new Error('Server error');
      const mockServer = {
        listen: vi.fn().mockReturnValue({
          on: vi.fn().mockImplementation((event, handler) => {
            if (event === 'error') {
              handler(mockError);
            }
          }),
        }),
      };

      const config = {
        port: 3000,
        host: '0.0.0.0',
        corsOptions: {} as any,
      };

      await expect(startServer(mockServer as any, config)).rejects.toThrow(
        'Server error',
      );
    });
  });

  describe('getNetworkIP', () => {
    it('should return the first non-internal IPv4 address', () => {
      mockNetworkInterfaces.mockReturnValue({
        eth0: [
          {family: 'IPv4', internal: false, address: '192.168.1.100'},
          {family: 'IPv6', internal: false, address: 'fe80::1'},
        ],
        lo: [{family: 'IPv4', internal: true, address: '127.0.0.1'}],
      });

      const ip = getNetworkIP();

      expect(ip).toBe('192.168.1.100');
    });

    it('should return localhost if no external interface found', () => {
      mockNetworkInterfaces.mockReturnValue({
        lo: [{family: 'IPv4', internal: true, address: '127.0.0.1'}],
      });

      const ip = getNetworkIP();

      expect(ip).toBe('localhost');
    });
  });
});
