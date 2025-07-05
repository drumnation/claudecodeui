import { useMemo } from 'react';

export const useClaudeLogo = (size) => {
  const logoSize = useMemo(() => {
    const validSizes = ['small', 'medium', 'large', 'xlarge'];
    return validSizes.includes(size) ? size : 'medium';
  }, [size]);

  return { logoSize };
};