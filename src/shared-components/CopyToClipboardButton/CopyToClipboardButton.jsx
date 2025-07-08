import React, { useEffect } from 'react';
import { Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useClipboard } from '@/hooks/useClipboard';
import { 
  getTextToCopy, 
  sanitizeTextForClipboard, 
  getAriaLabel, 
  getButtonTitle 
} from './CopyToClipboardButton.logic';
import * as S from './CopyToClipboardButton.styles';

export const CopyToClipboardButton = ({
  textToCopy,
  message,
  size = 'sm',
  className = '',
  ariaLabel,
  variant,
  onClick,
  ...props
}) => {
  const { copyToClipboard, isCopying, isSuccess, error, cleanup } = useClipboard();

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Determine what text to copy
    let finalTextToCopy = textToCopy;
    if (!finalTextToCopy && message) {
      finalTextToCopy = getTextToCopy(message);
    }

    if (!finalTextToCopy) {
      console.warn('No text provided to copy');
      return;
    }

    // Sanitize text before copying
    const sanitizedText = sanitizeTextForClipboard(finalTextToCopy);
    
    // Copy to clipboard
    const success = await copyToClipboard(sanitizedText);
    
    // Call custom onClick handler if provided
    if (onClick) {
      onClick(e, { success, text: sanitizedText });
    }
  };

  // Determine icon based on state
  const getIcon = () => {
    if (isCopying) return <Loader2 className="animate-spin" />;
    if (error) return <AlertCircle />;
    if (isSuccess) return <Check />;
    return <Copy />;
  };

  // Determine variant based on state
  const getVariant = () => {
    if (variant) return variant;
    if (error) return 'error';
    if (isSuccess) return 'success';
    return 'default';
  };

  const dynamicAriaLabel = ariaLabel || getAriaLabel(isSuccess, isCopying, error);
  const title = getButtonTitle(isSuccess, isCopying, error);

  return (
    <S.CopyButtonWrapper className={className}>
      <S.CopyButton
        type="button"
        size={size}
        variant={getVariant()}
        isLoading={isCopying}
        onClick={handleCopy}
        disabled={isCopying}
        aria-label={dynamicAriaLabel}
        title={title}
        onMouseDown={(e) => e.stopPropagation()}
        {...props}
      >
        <S.CopyIcon 
          size={size}
          isChanging={isCopying}
          isSuccess={isSuccess}
        >
          {getIcon()}
        </S.CopyIcon>
        <S.VisuallyHidden aria-live="polite">
          {isSuccess ? 'Copied!' : error ? 'Copy failed' : ''}
        </S.VisuallyHidden>
      </S.CopyButton>
    </S.CopyButtonWrapper>
  );
};