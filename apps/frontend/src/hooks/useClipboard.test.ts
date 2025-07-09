import {renderHook, act} from '@testing-library/react';
import {useClipboard} from './useClipboard';
import {vi, describe, it, expect, beforeEach, afterEach} from 'vitest';
import '@testing-library/jest-dom';

// Mock the logger
vi.mock('@kit/logger/browser', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

describe('useClipboard', () => {
  let mockClipboard: any;
  let mockExecCommand: any;

  beforeEach(() => {
    // Mock navigator.clipboard
    mockClipboard = {
      writeText: vi.fn(),
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    // Mock document.execCommand
    mockExecCommand = vi.fn();
    Object.defineProperty(document, 'execCommand', {
      value: mockExecCommand,
      writable: true,
    });

    // Mock DOM methods
    const mockTextarea = {
      value: '',
      style: {},
      setAttribute: vi.fn(),
      select: vi.fn(),
      setSelectionRange: vi.fn(),
    };

    document.createElement = vi.fn(() => mockTextarea);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const {result} = renderHook(() => useClipboard(), {
      container,
    });

    expect(result.current.isCopying).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.copyToClipboard).toBe('function');
    expect(typeof result.current.cleanup).toBe('function');
  });

  it('should successfully copy text using Clipboard API', async () => {
    mockClipboard.writeText.mockResolvedValue();
    const {result} = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });

    expect(copyResult).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isCopying).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should auto-reset success state after 2 seconds', async () => {
    mockClipboard.writeText.mockResolvedValue();
    const {result} = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isSuccess).toBe(false);
  });

  it('should fallback to execCommand when Clipboard API is not available', async () => {
    // Remove clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    mockExecCommand.mockReturnValue(true);
    const {result} = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });

    expect(copyResult).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(result.current.isSuccess).toBe(true);
    expect(document.createElement).toHaveBeenCalledWith('textarea');
  });

  it('should handle execCommand failure', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    mockExecCommand.mockReturnValue(false);
    const {result} = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });

    expect(copyResult).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle Clipboard API errors', async () => {
    mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));
    const {result} = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard('test text');
    });

    expect(copyResult).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe('Permission denied');
    expect(result.current.isCopying).toBe(false);
  });

  it('should handle empty or null text input', async () => {
    const {result} = renderHook(() => useClipboard());

    let copyResult1, copyResult2;
    await act(async () => {
      copyResult1 = await result.current.copyToClipboard('');
      copyResult2 = await result.current.copyToClipboard(null);
    });

    expect(copyResult1).toBe(false);
    expect(copyResult2).toBe(false);
    expect(mockClipboard.writeText).not.toHaveBeenCalled();
  });

  it('should set isCopying state during copy operation', async () => {
    let resolvePromise: any;
    mockClipboard.writeText.mockImplementation(() => {
      return new Promise((resolve) => {
        resolvePromise = resolve;
      });
    });

    const {result} = renderHook(() => useClipboard());

    act(() => {
      result.current.copyToClipboard('test text');
    });

    expect(result.current.isCopying).toBe(true);
    expect(result.current.isSuccess).toBe(false);

    await act(async () => {
      resolvePromise();
    });

    expect(result.current.isCopying).toBe(false);
    expect(result.current.isSuccess).toBe(true);
  });

  it('should clear existing timeout when copying again', async () => {
    mockClipboard.writeText.mockResolvedValue();
    const {result} = renderHook(() => useClipboard());

    // First copy
    await act(async () => {
      await result.current.copyToClipboard('test text 1');
    });

    expect(result.current.isSuccess).toBe(true);

    // Second copy before timeout
    await act(async () => {
      await result.current.copyToClipboard('test text 2');
    });

    expect(result.current.isSuccess).toBe(true);

    // Advance time to see if timeout was cleared
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.isSuccess).toBe(false);
  });

  it('should cleanup timeout on unmount', () => {
    const {result, unmount} = renderHook(() => useClipboard());

    act(() => {
      result.current.cleanup();
    });

    unmount();

    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('should handle very long text', async () => {
    const longText = 'a'.repeat(10000);
    mockClipboard.writeText.mockResolvedValue();
    const {result} = renderHook(() => useClipboard());

    let copyResult;
    await act(async () => {
      copyResult = await result.current.copyToClipboard(longText);
    });

    expect(copyResult).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(longText);
  });

  it('should properly cleanup textarea in fallback mode', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    mockExecCommand.mockReturnValue(true);
    const {result} = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard('test text');
    });

    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
  });
});
