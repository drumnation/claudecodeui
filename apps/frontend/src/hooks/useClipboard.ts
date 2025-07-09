import {useState, useCallback, useRef} from 'react';
import {createLogger} from '@kit/logger/browser';

const logger = createLogger({scope: 'useClipboard'});

export const useClipboard = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);

  const copyToClipboard = useCallback(async (text: any) => {
    if (!text) {
      logger.warn('No text provided to copy');
      return false;
    }

    setIsCopying(true);
    setError(null);
    setIsSuccess(false);

    try {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        logger.info('Text copied using Clipboard API');
      } else {
        // Fallback to execCommand
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        textarea.style.opacity = '0';
        textarea.setAttribute('readonly', '');
        textarea.setAttribute('aria-hidden', 'true');

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (!success) {
          throw new Error('execCommand failed');
        }

        logger.info('Text copied using execCommand fallback');
      }

      setIsSuccess(true);
      setIsCopying(false);

      // Auto-reset success state after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsSuccess(false);
      }, 2000);

      return true;
    } catch (err) {
      logger.error('Failed to copy text to clipboard', {
        error: err.message,
        hasClipboardAPI: !!navigator.clipboard,
      });
      setError(err.message);
      setIsCopying(false);
      return false;
    }
  }, []);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    copyToClipboard,
    isCopying,
    isSuccess,
    error,
    cleanup,
  };
};
