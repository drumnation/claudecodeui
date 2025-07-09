import React from 'react';
import {X, AlertTriangle} from 'lucide-react';
import {Button} from '@/shared-components/Button/Button';
import * as S from './ConfirmationModal.styles';

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'destructive',
  onConfirm,
  onCancel,
  isLoading = false,
}: any) => {
  if (!isOpen) return null;

  return (
    <S.Overlay onClick={onCancel}>
      <S.Modal onClick={(e: any) => e.stopPropagation()}>
        <S.Header>
          <S.IconWrapper>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </S.IconWrapper>
          <S.Title>{title}</S.Title>
          <S.CloseButton onClick={onCancel} disabled={isLoading}>
            <X className="w-4 h-4" />
          </S.CloseButton>
        </S.Header>

        <S.Content>
          <S.Message>{message}</S.Message>
        </S.Content>

        <S.Actions>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </S.Actions>
      </S.Modal>
    </S.Overlay>
  );
};
