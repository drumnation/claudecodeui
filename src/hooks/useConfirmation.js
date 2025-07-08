import { useState, useCallback } from 'react';

export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'destructive',
    onConfirm: null,
    isLoading: false
  });

  const showConfirmation = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmationState({
        isOpen: true,
        title: options.title || 'Confirm Action',
        message: options.message || 'Are you sure you want to proceed?',
        confirmText: options.confirmText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        confirmVariant: options.confirmVariant || 'destructive',
        onConfirm: () => {
          resolve(true);
          setConfirmationState(prev => ({ ...prev, isOpen: false }));
        },
        isLoading: false
      });
    });
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setLoading = useCallback((loading) => {
    setConfirmationState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmationState.onConfirm) {
      setLoading(true);
      try {
        await confirmationState.onConfirm();
      } catch (error) {
        console.error('Confirmation action failed:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [confirmationState.onConfirm, setLoading]);

  const handleCancel = useCallback(() => {
    hideConfirmation();
  }, [hideConfirmation]);

  return {
    confirmationState,
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    handleCancel,
    setLoading
  };
};